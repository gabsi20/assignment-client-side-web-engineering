const Pouch = require("pouchdb");
const config = require("./config");

const db = new Pouch(config.db.name);

module.exports = { db };
