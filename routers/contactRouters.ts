import express, { Request, Response } from 'express';
import { Database } from 'sqlite3';
import { ContactModel } from '../models/contact';

const router = express.Router();

//  create an object of database
const db = new Database(':memory:');
const contactModel = new ContactModel(db);

// create the database table
contactModel.createTable()
  .then(() => {
    console.log('Contacts table created');
})
  .catch((error) => {
    console.error('Error creating contacts table:', error);
});

router.post('/identify', async (req: Request, res: Response) => {
    res.send();
});

export default router;