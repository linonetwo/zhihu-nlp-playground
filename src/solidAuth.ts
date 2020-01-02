import solidAuth from 'solid-auth-cli';
import fs from 'fs';
import path from 'path';
import data from '@solid/query-ldflex';

// Get full chain CA and local CA added by mkcert, so secure TLS can be established
const rootCAs = require('ssl-root-cas/latest').create();
rootCAs.addFile(process.env.MKCERT_PATH);
require('https').globalAgent.options.ca = rootCAs;

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'));

solidAuth.login({ idp: 'https://localhost:8443/', username: config.solidUserName, password: config.solidPassword });

const me = data[`https://${config.solidUserName}.localhost:8443/profile/#me`];
showProfile(me);

async function showProfile(person: any) {
  const label = await person.label;
  console.log(`\nNAME: ${label}`);

  console.log('\nTYPES');
  for await (const type of person.type) console.log(`  - ${type}`);

  console.log('\nFRIENDS');
  for await (const name of person.friends.firstName) console.log(`  - ${name} is a friend`);
}
