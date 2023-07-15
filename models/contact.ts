import { Database } from 'sqlite3';

interface ContactAttributes {
  id?: number;
  phoneNumber: string | null;
  email: string | null;
  linkedId: number | null;
  linkPrecedence: 'primary' | 'secondary';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class ContactModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  createTable(): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phoneNumber TEXT,
          email TEXT,
          linkedId INTEGER,
          linkPrecedence TEXT,
          createdAt TEXT,
          updatedAt TEXT,
          deletedAt TEXT
        )
      `;

      this.db.run(query, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
