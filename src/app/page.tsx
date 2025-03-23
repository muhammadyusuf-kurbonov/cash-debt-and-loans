import { ContactList } from '@/components/contacts-list';
import { addNewContact, getContacts } from './actions';

export default async function Home() {
  const contacts = await getContacts();
  return (
    <ContactList contacts={contacts} onNewContactCreate={addNewContact} />
  );
}
