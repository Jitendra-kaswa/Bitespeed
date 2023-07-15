import { Database } from 'sqlite3';
import { ContactAttributes } from './interfaces/contactTableAttributes';
import { IContactModel } from './interfaces/contactTable';


export class ContactModel implements IContactModel{
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

  createContact(contact: ContactAttributes): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO contacts (phoneNumber, email, linkedId, linkPrecedence, createdAt, updatedAt, deletedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        contact.phoneNumber,
        contact.email,
        contact.linkedId,
        contact.linkPrecedence,
        contact.createdAt.toISOString(),
        contact.updatedAt.toISOString(),
        contact.deletedAt?.toISOString(),
      ];

      this.db.run(query, values, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  findOneContactByEmailOrPhoneNumber(email: string, phoneNumber: string): Promise<ContactAttributes | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM contacts WHERE email = ? OR phoneNumber = ?`;

      this.db.get(query, [email, phoneNumber], (err, row) => {
        if (err) {
          reject(err);
        } else {
            resolve(row ? (row as ContactAttributes) : null);
        }
      });
    });
  }

  findAllContactsByLinkedId(linkedId: number): Promise<ContactAttributes[]> {
    return new Promise((resolve, reject) => {
      const query = ` SELECT * FROM contacts WHERE linkedId = ?`;

      this.db.all(query, [linkedId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows ? rows as ContactAttributes[]: []);
        }
      });
    });
  }
}
