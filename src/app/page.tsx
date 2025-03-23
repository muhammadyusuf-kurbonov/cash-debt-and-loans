import { getContacts } from './actions';
import HomePageContent from './content';

export default async function Home() {
  const contacts = await getContacts();
  return (
    <HomePageContent contacts={contacts} />
  );
}
