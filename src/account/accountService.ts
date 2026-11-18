// SQL Legends' own student accounts — same pattern as Python Legends
// (see python-legends/src/account/accountService.ts): a name + PIN the
// student picks the first time, resumed from any device via the same
// shared Google Apps Script backend DigiClass already runs.
//
// This is a *separate* roster from both DigiClass's own students and from
// Python Legends' ("SQL Students"/"SQL Progress" sheets, and sqlclaim/
// sqlload/sqlsave actions — not plclaim/plload/plsave) so progress in one
// game never collides with or overwrites progress in the other, even for
// a student who plays both under the same name.

import type { ProgressState } from '../progress/progressService';

export type SavedProgress = ProgressState;

export interface AccountIdentity {
  sid: string;
  name: string;
}

// Same Apps Script deployment DigiClass and Python Legends both point at
// (see digiclass/src/app.js's DC_CLASS.endpoint) — not a secret; access is
// gated by PIN, not by hiding this URL.
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbzpEpFmRbIbacu4-BgICaT3ZN8TIwOgti8pT76gmNmftQbSbJoErzM86G4ikxHgZEfFcg/exec';

const IDENTITY_KEY = 'sql-legends:account:v1';

export type LoginError = 'short' | 'pin' | 'busy' | 'network' | 'unknown';

function get(query: string): Promise<any> {
  return fetch(`${ENDPOINT}?${query}&t=${Date.now()}`).then((r) => r.json());
}

function post(body: unknown): Promise<any> {
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

export const accountService = {
  getSavedIdentity(): AccountIdentity | null {
    try {
      const raw = localStorage.getItem(IDENTITY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  logOut() {
    try {
      localStorage.removeItem(IDENTITY_KEY);
    } catch {
      // Best-effort.
    }
  },

  async logIn(name: string, pin: string): Promise<AccountIdentity> {
    let json: any;
    try {
      json = await get(`action=sqlclaim&name=${encodeURIComponent(name)}&pin=${encodeURIComponent(pin)}`);
    } catch {
      throw 'network' as LoginError;
    }
    if (json?.error) throw (json.error as LoginError) ?? 'unknown';
    if (!json?.sid) throw 'unknown' as LoginError;
    const identity: AccountIdentity = { sid: json.sid, name };
    try {
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
    } catch {
      // Best-effort; the session still works, just won't be remembered on reload.
    }
    return identity;
  },

  async loadProgress(sid: string): Promise<SavedProgress | null> {
    try {
      const json = await get(`action=sqlload&sid=${encodeURIComponent(sid)}`);
      return json?.ok ? (json.progress ?? null) : null;
    } catch {
      return null;
    }
  },

  saveProgress(sid: string, progress: SavedProgress) {
    post({ kind: 'sqlsave', sid, progress }).catch(() => {
      // Swallowed deliberately — the next completion event pushes a fresher
      // snapshot anyway.
    });
  },
};
