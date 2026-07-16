const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const users = Datastore.create({ filename: path.join(dataDir, 'users.db'), autoload: true });
const files = Datastore.create({ filename: path.join(dataDir, 'files.db'), autoload: true });
const chats = Datastore.create({ filename: path.join(dataDir, 'chats.db'), autoload: true });
const reports = Datastore.create({ filename: path.join(dataDir, 'reports.db'), autoload: true });

users.ensureIndex({ fieldName: 'email', unique: true });

module.exports = { users, files, chats, reports };
