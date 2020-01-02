import solidAuth from 'solid-auth-cli';
import fs from 'fs';
import path from 'path';
import data from '@solid/query-ldflex';

// Get full chain CA and local CA added by mkcert, so secure TLS can be established
const rootCAs = require('ssl-root-cas/latest').create();
rootCAs.addFile(process.env.MKCERT_PATH);
require('https').globalAgent.options.ca = rootCAs;

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config.json'), 'utf-8'));

export async function getSoLiDSession() {
  return solidAuth.login({
    idp: 'https://localhost:8443/',
    username: config.solidUserName,
    password: config.solidPassword,
  });
}
