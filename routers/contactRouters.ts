import express, { Request, Response } from 'express';
import { Database } from 'sqlite3';
import { ContactModel } from '../models/contact';
import { ContactAttributes } from '../models/interfaces/contactTableAttributes';
import { shouldNotCreateNewSecondaryContact, getPrimaryContactIndex, extractContactInfo } from '../utils/contactModel';

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

async function updatePrimaryToSecondary(primaryContacts: ContactAttributes[], newLinkedId: number) {
  primaryContacts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  for (const contact of primaryContacts) {
    await contactModel.updateContact(contact.id!, newLinkedId, 'secondary', new Date());
  }
}

async function updateSecondaryToSecondary(secondaryContacts: ContactAttributes[], newLinkedId: number) {
  for (const contact of secondaryContacts) {
    if (contact.linkedId !== newLinkedId) {
      await contactModel.updateContact(contact.id!, newLinkedId, 'secondary', new Date());
    }
  }
}

async function processPrimaryAndSecondaryContacts(existingContact: ContactAttributes[]): Promise<number | null> {
  const primaryContacts: ContactAttributes[] = [];
  const secondaryContacts: ContactAttributes[] = [];

  for (const contact of existingContact) {
    if (contact.linkPrecedence === 'primary') {
      primaryContacts.push(contact);
    } else {
      secondaryContacts.push(contact);
    }
  }

  if (primaryContacts.length === 1) {
    return primaryContacts[0].id!;
  } else if (primaryContacts.length === 0) {
    return null;
  } else {
    const newLinkedId: number = primaryContacts[0].id!;
    await updatePrimaryToSecondary(primaryContacts.slice(1), newLinkedId);
    await updateSecondaryToSecondary(secondaryContacts, newLinkedId);
    return null;
  }
}

router.post('/identify', async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;

  if (email == null && phoneNumber == null) {
    return res.status(422).json({ error: 'Unprocessable entities' })
  }

  try {
    const existingContact: ContactAttributes[] = await contactModel.findContactByEmailOrPhoneNumber(
      email,
      phoneNumber
    );

    if (existingContact.length > 0) {
      var linkedIdForContact: number | null = await processPrimaryAndSecondaryContacts(existingContact);

      if (shouldNotCreateNewSecondaryContact(existingContact, email, phoneNumber)) {
        linkedIdForContact = null;
      }

      if (linkedIdForContact != null) { // create new secondary
        const newContact: ContactAttributes = {
          phoneNumber,
          email,
          linkedId: linkedIdForContact,
          linkPrecedence: 'secondary',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };
        const createdContactId = await contactModel.createContact(newContact);
      }

      const allContactsBasedOnEmailOrPhone = await contactModel.findContactByEmailOrPhoneNumber(email, phoneNumber);
      const primaryKey: number | null = allContactsBasedOnEmailOrPhone[0].linkedId ?? allContactsBasedOnEmailOrPhone[0].id!;
      const allContacts = await contactModel.findAllContactsByLinkedId(primaryKey);
      const primaryContactIndex = getPrimaryContactIndex(allContacts);

      const pContact: number | null = primaryContactIndex !== null ? allContacts[primaryContactIndex].id! : null;
      const emails: string[] = [];
      const phoneNumbers: string[] = [];
      const sContacts: number[] = [];

      if (primaryContactIndex !== null) {
        extractContactInfo(allContacts[primaryContactIndex], emails, phoneNumbers, sContacts);
      }

      for (const contact of allContacts) {
        if (contact.linkPrecedence !== 'primary') {
          extractContactInfo(contact, emails, phoneNumbers, sContacts);
        }
      }

      res.json({
        contact: {
          primaryContactId: pContact,
          emails: emails,
          phoneNumbers: phoneNumbers,
          secondaryContactIds: sContacts,
        },
      });

    } else {
      const newContact: ContactAttributes = {
        phoneNumber,
        email,
        linkedId: null,
        linkPrecedence: 'primary',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      const createdContactId = await contactModel.createContact(newContact);
      res.json({
        contact: {
          primaryContactId: createdContactId,
          emails: [newContact.email],
          phoneNumbers: [newContact.phoneNumber],
          secondaryContactIds: [],
        },
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
});

export default router;