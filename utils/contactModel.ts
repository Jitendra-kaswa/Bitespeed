import { ContactAttributes } from "../models/interfaces/contactTableAttributes";

export function shouldNotCreateNewSecondaryContact(
    existingContact: ContactAttributes[],
    email: string | null,
    phoneNumber: string | null
): boolean {
    let isEmailFound = false;
    let isPhoneFound = false;

    for (const contact of existingContact) {
        if (email != null && contact.email === email) {
            isEmailFound = true;
        }
        if (phoneNumber != null && contact.phoneNumber === phoneNumber) {
            isPhoneFound = true;
        }
    }

    return (isEmailFound && isPhoneFound) || (email === null && isPhoneFound) || (phoneNumber === null && isEmailFound);
}

export function getPrimaryContactIndex(contacts: ContactAttributes[]): number | null {
    for (let i = 0; i < contacts.length; i++) {
        if (contacts[i].linkPrecedence === 'primary') {
            return i;
        }
    }
    return null;
}

export function extractContactInfo(contact: ContactAttributes, emails: string[], phoneNumbers: string[], sContacts: number[]): void {
    if (contact.email !== null) {
        if (emails.length === 0 || contact.email !== emails[emails.length - 1]) {
            emails.push(contact.email);
        }
    }
    if (contact.phoneNumber !== null) {
        if (phoneNumbers.length === 0 || contact.phoneNumber !== phoneNumbers[phoneNumbers.length - 1]) {
            phoneNumbers.push(contact.phoneNumber);
        }
    }
    if (contact.linkPrecedence !== 'primary') {
        sContacts.push(contact.id!);
    }
}