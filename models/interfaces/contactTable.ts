import { ContactAttributes } from './contactTableAttributes';

export interface IContactModel {
    createTable(): Promise<void>;
    createContact(contact: ContactAttributes): Promise<number>;
    findContactByEmailOrPhoneNumber(email: string, phoneNumber: string): Promise<ContactAttributes[]>;
    findAllContactsByLinkedId(linkedId: number): Promise<ContactAttributes[]>;
}