import { useState } from 'react';
import { accountService, type LoginError } from '../account/accountService';
import { Emblem } from './Emblem';
import './shared.css';

const ERROR_MESSAGES: Record<LoginError, string> = {
  short: 'Pick a PIN of at least 4 digits.',
  pin: "That PIN doesn't match this name — try again, or ask your teacher to reset it.",
  busy: 'Too many tries — wait a bit and try again.',
  network: "Couldn't reach the server. Check your internet and try again.",
  unknown: 'Something went wrong. Please try again.',
};

export function LoginScreen({ onLoggedIn }: { onLoggedIn: (name: string, sid: string) => void }) {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setError('Type your name.'); return; }
    if (pin.trim().length < 4) { setError(ERROR_MESSAGES.short); return; }
    setBusy(true);
    setError(null);
    try {
      const identity = await accountService.logIn(trimmed, pin.trim());
      onLoggedIn(identity.name, identity.sid);
    } catch (err) {
      const key = (typeof err === 'string' ? err : 'unknown') as LoginError;
      setError(ERROR_MESSAGES[key] ?? ERROR_MESSAGES.unknown);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sl-login-screen">
      <div className="sl-login-card">
        <div className="sl-login-crest"><Emblem size={56} /></div>
        <h1 className="sl-login-title">SQL Legends</h1>
        <p className="sl-login-sub">Jump, collect coins, and query your way through Database Island.</p>
        <form onSubmit={submit}>
          <label className="sl-field-label" htmlFor="sl-name">Your name</label>
          <input id="sl-name" className="sl-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aisha Rahman" autoComplete="off" />
          <label className="sl-field-label" htmlFor="sl-pin">Your PIN</label>
          <input id="sl-pin" className="sl-input" type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Pick a 4+ digit PIN the first time" autoComplete="off" />
          {error && <p className="sl-error">{error}</p>}
          <button className="sl-btn sl-btn-primary" type="submit" disabled={busy}>
            {busy ? 'Checking…' : 'Start Adventure →'}
          </button>
        </form>
        <p className="sl-login-note">First time? Pick any PIN — this becomes your SQL Legends account. It's separate from your Python Legends PIN, so they can be different.</p>
      </div>
    </div>
  );
}
