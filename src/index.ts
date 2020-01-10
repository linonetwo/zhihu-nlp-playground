import solidAuth from 'solid-auth-cli';
import { getSoLiDSession } from './solidAuth';

function putFile(content: string, session: any) {}

(async function main() {
  const session = await getSoLiDSession();
  const publicFolder = session.webId.replace('profile/card#me', 'public');
  await solidAuth.fetch(`${publicFolder}/zhihu/aa.txt`, {
    method: 'PUT',
    headers: { 'Content-Type': 'text' },
    body: 'asdf',
  });
})();
