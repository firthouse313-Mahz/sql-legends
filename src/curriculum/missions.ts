// World 1 (Database Island) mission content: one Mission per level, each a
// sequence of Activities (see activities.ts). This is the real, authored
// content behind the question blocks the platformer level places — the
// level geometry (platforms.ts) only says *where* a block sits; this file
// says what's inside it.

import type { Activity } from './activities';

export interface Mission {
  id: string;
  levelId: string;
  title: string;
  introStory: string;
  activities: Activity[];
  rewardXp: number;
  rewardCoins: number;
}

export const MISSIONS: Record<string, Mission> = {
  'w1-l1': {
    id: 'w1-l1',
    levelId: 'w1-l1',
    title: 'What is a Database?',
    introStory:
      "You wash up on Database Island. A friendly robot explains: everything here runs on ONE idea — stop storing facts in scattered notebooks, and keep them in one organised place a computer can search.",
    rewardXp: 40,
    rewardCoins: 15,
    activities: [
      {
        id: 'w1-l1-a1',
        kind: 'concept',
        pathway: 'common',
        title: 'Why not just use files?',
        body: [
          'Before databases, schools kept records in separate files — one for marks, another for attendance, another for fees. The same student\'s name was typed again and again, in every file.',
          'A **database** is an organised collection of related data, stored so it can be entered, searched, updated and retrieved efficiently — usually managed by software called a **DBMS** (Database Management System), e.g. MySQL, Oracle, PostgreSQL.',
          'Keeping data in a database instead of loose files fixes two problems: **data redundancy** (the same fact typed in many places) and **data inconsistency** (those copies disagreeing after only one gets updated).',
        ],
      },
      {
        id: 'w1-l1-a2',
        kind: 'predict',
        pathway: 'common',
        examTag: 'CBSE · Very Short Answer',
        prompt:
          'A school keeps one Excel sheet for marks and a separate Word document for addresses — both list every student\'s name again. When a student\'s name is corrected in one file but not the other, this is an example of:',
        options: ['Data redundancy', 'Data inconsistency', 'A primary key', 'A relational schema'],
        correctIndex: 1,
        explanation:
          'Redundancy is the duplication itself (the name stored twice); inconsistency is what happens when those duplicates fall out of sync — exactly what happened here.',
      },
      {
        id: 'w1-l1-a3',
        kind: 'arrange',
        pathway: 'common',
        examTag: 'CBSE · Define in order',
        prompt: 'Arrange these words into the correct definition of a database:',
        tokens: ['An', 'organised', 'collection', 'of', 'related', 'data'],
        correctOrder: [0, 1, 2, 3, 4, 5],
        explanation: 'A database is an organised collection of related data — the three key words examiners look for are organised, collection and related.',
      },
      {
        id: 'w1-l1-a4',
        kind: 'find-error',
        pathway: 'common',
        examTag: 'CBSE · Find the flaw in the statement',
        prompt: 'One of these statements about databases is WRONG. Which one?',
        snippet: [
          'A database reduces data redundancy compared to scattered files.',
          'A DBMS is software used to create and manage a database.',
          'A database can only ever store numbers, never text.',
          'A database helps keep data consistent across an organisation.',
        ],
        errorIndex: 2,
        explanation: 'Databases routinely store text, dates, numbers and more — "only numbers" is the false statement.',
      },
      {
        id: 'w1-l1-a5',
        kind: 'complete',
        pathway: 'common',
        examTag: 'CBSE · Fill in the blank',
        prompt: 'Complete the sentence:',
        template: 'MySQL, Oracle and PostgreSQL are all examples of a ____.',
        options: ['DBMS', 'primary key', 'record', 'field'],
        correctIndex: 0,
        explanation: 'MySQL, Oracle and PostgreSQL are all DBMS software — programs used to create and manage databases.',
      },
    ],
  },

  'w1-l2': {
    id: 'w1-l2',
    levelId: 'w1-l2',
    title: 'Relational Databases',
    introStory:
      'Deeper into the island, you find rows of floating tables — each one a grid of facts. The robot calls this the relational model: the most common way a database organises its data.',
    rewardXp: 45,
    rewardCoins: 15,
    activities: [
      {
        id: 'w1-l2-a1',
        kind: 'concept',
        pathway: 'common',
        title: 'Data in rows and columns',
        body: [
          'A **relational database** stores data in **tables** (also called **relations**) — grids of rows and columns, much like a spreadsheet.',
          'Each **row** (also called a **tuple**) is one complete record — e.g. one student. Each **column** (also called an **attribute**) is one kind of fact about every row — e.g. "Name" or "Marks".',
          'Different tables can be linked together through a common column — e.g. a Students table and a Marks table can both have a "StudentID" column, letting the database connect a student to their marks.',
        ],
        table: {
          columns: ['StudentID', 'Name', 'Class'],
          rows: [
            [1, 'Aisha', '11'],
            [2, 'Rohan', '12'],
          ],
        },
      },
      {
        id: 'w1-l2-a2',
        kind: 'predict',
        pathway: 'common',
        examTag: 'CBSE · Application-based',
        context: 'Table: StudentID | Name | Class — with two rows of data, as shown above.',
        prompt: 'In relational database terms, each row of this table is also called a:',
        options: ['Field', 'Attribute', 'Tuple', 'Schema'],
        correctIndex: 2,
        explanation: 'A row is a tuple (one complete record). A column is an attribute/field; the overall table design is its schema.',
      },
      {
        id: 'w1-l2-a3',
        kind: 'complete',
        pathway: 'common',
        examTag: 'CBSE · Fill in the blank',
        prompt: 'Complete the sentence:',
        template: 'A column in a relational table is also called an ____.',
        options: ['attribute', 'tuple', 'index', 'engine'],
        correctIndex: 0,
        explanation: 'Column = attribute (also called field). Row = tuple.',
      },
      {
        id: 'w1-l2-a4',
        kind: 'find-error',
        pathway: 'common',
        examTag: 'CBSE · Find the flaw',
        prompt: 'Which statement about relational tables is WRONG?',
        snippet: [
          'A relational table is also called a relation.',
          'Every row in a table must have the same number of columns.',
          'Two tables can be linked through a column they both share.',
          'A relational table can have a different number of columns in every row.',
        ],
        errorIndex: 3,
        explanation: 'Every row in a relational table has the same set of columns — a row with extra or missing columns would break the table structure.',
      },
      {
        id: 'w1-l2-a5',
        kind: 'arrange',
        pathway: 'common',
        examTag: 'CBSE · Match the order',
        prompt: 'Arrange from SMALLEST to LARGEST unit of relational data:',
        tokens: ['Field (one value)', 'Record (one row)', 'Table (a relation)', 'Database (many tables)'],
        correctOrder: [0, 1, 2, 3],
        explanation: 'A field holds one value, many fields make a record, many records make a table, and many related tables make a database.',
      },
    ],
  },

  'w1-l3': {
    id: 'w1-l3',
    levelId: 'w1-l3',
    title: 'Tables, Records and Fields',
    introStory:
      'A grand library of floating tables appears. To move on, you must correctly name their parts: which rows are records, which columns are fields.',
    rewardXp: 45,
    rewardCoins: 20,
    activities: [
      {
        id: 'w1-l3-a1',
        kind: 'concept',
        pathway: 'common',
        title: 'The anatomy of a table',
        body: [
          'A **table** is the full grid. A **field** (column) is one category of information — like "Name" or "Marks". A **record** (row) is one complete set of field values for one entity — one student, one book, one order.',
          'Example: in a Student table with fields RollNo, Name, Marks — the record "(3, Meera, 88)" is one student\'s complete data across all three fields.',
        ],
        table: {
          columns: ['RollNo', 'Name', 'Marks'],
          rows: [
            [1, 'Kabir', 76],
            [2, 'Zara', 91],
            [3, 'Meera', 88],
          ],
        },
      },
      {
        id: 'w1-l3-a2',
        kind: 'predict',
        pathway: 'common',
        examTag: 'CBSE · Application-based',
        context: 'Table above: RollNo | Name | Marks, 3 rows of data.',
        prompt: 'How many fields and how many records does this table have?',
        options: ['3 fields, 3 records', '3 fields, 4 records', '4 fields, 3 records', '3 fields, 2 records'],
        correctIndex: 0,
        explanation: 'There are 3 columns (RollNo, Name, Marks) = 3 fields, and 3 rows of data = 3 records.',
      },
      {
        id: 'w1-l3-a3',
        kind: 'complete',
        pathway: 'common',
        examTag: 'CBSE · Fill in the blank',
        prompt: 'Complete the sentence:',
        template: 'One complete row of data about a single entity is called a ____.',
        options: ['record', 'field', 'database', 'schema'],
        correctIndex: 0,
        explanation: 'A record is one row — one entity\'s complete set of field values.',
      },
      {
        id: 'w1-l3-a4',
        kind: 'find-error',
        pathway: 'common',
        examTag: 'CBSE · Find the flaw',
        prompt: 'Which statement is WRONG?',
        snippet: [
          'A field stores one kind of information for every record.',
          'A record is one complete row of data.',
          'A table must have at least two records to be valid.',
          'Two different records in the same table share the same set of fields.',
        ],
        errorIndex: 2,
        explanation: 'A table can validly have zero, one, or any number of records — there is no rule requiring at least two.',
      },
      {
        id: 'w1-l3-a5',
        kind: 'arrange',
        pathway: 'common',
        examTag: 'CBSE · Build the definition',
        prompt: 'Arrange into the correct definition of a FIELD:',
        tokens: ['A', 'field', 'holds', 'one', 'kind', 'of', 'data', 'for every record'],
        correctOrder: [0, 1, 2, 3, 4, 5, 6, 7],
        explanation: 'A field holds one kind of data for every record — e.g. every record\'s "Marks" field holds that student\'s marks.',
      },
    ],
  },

  'w1-l4': {
    id: 'w1-l4',
    levelId: 'w1-l4',
    title: 'Primary Keys',
    introStory:
      'At the island\'s castle gate, a riddle: "Which field never repeats, and never stays empty?" Answer correctly, and the gate recognises your table\'s one true key.',
    rewardXp: 55,
    rewardCoins: 25,
    activities: [
      {
        id: 'w1-l4-a1',
        kind: 'concept',
        pathway: 'common',
        title: 'The field that identifies a record',
        body: [
          'A **primary key** is a field (or set of fields) whose value uniquely identifies each record in a table — no two records can share it, and it can never be left empty (NULL).',
          'A field that *could* serve as a primary key (unique, non-empty) but wasn\'t chosen is called a **candidate key**; any candidate key not chosen becomes an **alternate key**.',
          'Example: in a Student table, RollNo makes a good primary key (unique per student). Name is a poor choice — two students could share a name.',
        ],
        table: {
          columns: ['RollNo', 'Name', 'Marks'],
          rows: [
            [1, 'Kabir', 76],
            [2, 'Zara', 91],
            [3, 'Zara', 88],
          ],
        },
      },
      {
        id: 'w1-l4-a2',
        kind: 'predict',
        pathway: 'common',
        examTag: 'CBSE · Application-based',
        context: 'Table above — notice two different students are both named "Zara".',
        prompt: 'Based on this table, which field should be the PRIMARY KEY?',
        options: ['Name', 'Marks', 'RollNo', 'None — this table cannot have one'],
        correctIndex: 2,
        explanation: 'RollNo is unique for every record; Name repeats (two "Zara" rows) so it cannot be the primary key.',
      },
      {
        id: 'w1-l4-a3',
        kind: 'complete',
        pathway: 'common',
        examTag: 'CBSE · Fill in the blank',
        prompt: 'Complete the sentence:',
        template: 'A candidate key that is NOT chosen as the primary key is called an ____.',
        options: ['alternate key', 'attribute', 'record', 'relation'],
        correctIndex: 0,
        explanation: 'Candidate keys not chosen as the primary key become alternate keys.',
      },
      {
        id: 'w1-l4-a4',
        kind: 'find-error',
        pathway: 'common',
        examTag: 'CBSE · Find the flaw',
        prompt: 'Which statement about primary keys is WRONG?',
        snippet: [
          'A primary key value must be unique for every record.',
          'A primary key field can be left empty (NULL) for some records.',
          'A table can have only one primary key.',
          'A good primary key never changes once set, so other tables can safely reference it.',
        ],
        errorIndex: 1,
        explanation: 'A primary key can NEVER be NULL — that is one of its two defining rules, alongside uniqueness.',
      },
      {
        id: 'w1-l4-a5',
        kind: 'write',
        pathway: 'common',
        examTag: 'CBSE · Your first live query',
        prompt:
          'Database Island\'s gate finally opens onto the real database you\'ll use throughout SQL Legends. As a first look — before World 2 teaches SQL properly — try running: SELECT * FROM Student;  to see every record and field for yourself.',
        starter: 'SELECT * FROM Student;',
        expectedSql: 'SELECT * FROM Student;',
        hint: 'You don\'t need to change anything yet — press Run to execute this exact query and see the real table.',
      },
    ],
  },
};

export const BOSS_MISSION: Mission = {
  id: 'w1-boss',
  levelId: 'w1-boss',
  title: 'Boss Battle: The Redundancy Raider',
  introStory:
    'The Redundancy Raider guards Database Island\'s exit, throwing scrambled, broken and ambiguous statements at you. Answer its full gauntlet to earn your Database Island badge and open the road to SQL Starter World.',
  rewardXp: 100,
  rewardCoins: 50,
  activities: [
    {
      id: 'w1-boss-a1',
      kind: 'predict',
      pathway: 'common',
      examTag: 'CBSE · Boss Round 1',
      prompt: 'A school stores the same address in three different files. Updating it in only one file causes:',
      options: ['Data redundancy only', 'Data inconsistency', 'A primary key violation', 'A relational join'],
      correctIndex: 1,
      explanation: 'The duplication was already redundancy; the disagreement after an incomplete update is inconsistency.',
    },
    {
      id: 'w1-boss-a2',
      kind: 'find-error',
      pathway: 'common',
      examTag: 'CBSE · Boss Round 2',
      prompt: 'Which claim is WRONG?',
      snippet: [
        'A table\'s rows are called records or tuples.',
        'A table\'s columns are called fields or attributes.',
        'A primary key field is allowed to repeat across records.',
        'A DBMS is software that creates and manages databases.',
      ],
      errorIndex: 2,
      explanation: 'A primary key must be unique for every record — it can never repeat.',
    },
    {
      id: 'w1-boss-a3',
      kind: 'complete',
      pathway: 'common',
      examTag: 'CBSE · Boss Round 3',
      prompt: 'Complete the sentence:',
      template: 'A field whose values uniquely identify every record, and can never be NULL, is the ____.',
      options: ['primary key', 'candidate key', 'foreign key', 'attribute'],
      correctIndex: 0,
      explanation: 'Unique + never NULL is the definition of a primary key.',
    },
    {
      id: 'w1-boss-a4',
      kind: 'arrange',
      pathway: 'common',
      examTag: 'CBSE · Boss Round 4',
      prompt: 'Arrange from SMALLEST to LARGEST:',
      tokens: ['Field', 'Record', 'Table', 'Database'],
      correctOrder: [0, 1, 2, 3],
      explanation: 'Field < Record < Table < Database, each one built from many of the last.',
    },
    {
      id: 'w1-boss-a5',
      kind: 'write',
      pathway: 'common',
      examTag: 'CBSE · Boss Finisher',
      prompt: 'Finish the Raider: run a query that shows only the Name and Marks columns from the Student table (every record).',
      starter: 'SELECT Name, Marks FROM Student;',
      expectedSql: 'SELECT Name, Marks FROM Student;',
      hint: 'List just the two column names you want, separated by a comma, right after SELECT.',
    },
  ],
};
