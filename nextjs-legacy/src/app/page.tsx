import { getContacts } from './actions';
import HomePageContent from './content';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const contacts = await getContacts();
  return (
    <HomePageContent contacts={contacts} />
  );
}
