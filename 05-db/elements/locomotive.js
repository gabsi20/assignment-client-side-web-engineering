const html = require('choo/html');
const emoji = require('node-emoji');

module.exports = (state, prev, send) => html`${emoji.emojify('steam_locomotive')}`;
