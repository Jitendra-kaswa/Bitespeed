import { ContactAttributes } from './contactTableAttributes';

export interface IContactModel {
    createTable(): Promise<void>;
    createContact(contact: ContactAttributes): Promise<number>;
    findOneContactByEmailOrPhoneNumber(email: string, phoneNumber: string): Promise<ContactAttributes | null>;
    findAllContactsByLinkedId(linkedId: number): Promise<ContactAttributes[]>;
}