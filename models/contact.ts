import { Database } from 'sqlite3';
import { ContactAttributes } from './interfaces/contactTableAttributes';
import { IContactModel } from './interfaces/contactTable';


export class ContactModel implements IContactModel {
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

  findContactByEmailOrPhoneNumber(email: string | null, phoneNumber: string | null): Promise<ContactAttributes[]> {
    return new Promise((resolve, reject) => {
      var query: string = "";
      var queryParams: any[] = [];
      if (phoneNumber == null) {
        query = `SELECT * FROM contacts WHERE email = ?`;
        queryParams = [email];
      } else if (email == null) {
        query = `SELECT * FROM contacts WHERE phoneNumber = ?`;
        queryParams = [phoneNumber];
      } else {
        query = `SELECT * FROM contacts WHERE email = ? OR phoneNumber = ?`;
        queryParams = [email, phoneNumber];
      }
      this.db.all(query, queryParams, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row != undefined ? (row as ContactAttributes[]) : []);
        }
      });
    });
  }

  findAllContactsByLinkedId(linkedId: number): Promise<ContactAttributes[]> {
    return new Promise((resolve, reject) => {
      const query = ` SELECT * FROM contacts WHERE linkedId = ? OR id = ?`;

      this.db.all(query, [linkedId, linkedId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows ? rows as ContactAttributes[] : []);
        }
      });
    });
  }

  updateContact(id: number, linkedId: number, linkedPreference: 'primary' | 'secondary', updatedAt: Date): Promise<void> {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE contacts
        SET linkedId = ?, linkPrecedence = ?, updatedAt = ?
        WHERE id = ?
      `;

      const values = [
        linkedId,
        linkedPreference,
        updatedAt.toISOString(),
        id,
      ];

      this.db.run(query, values, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
