#!/usr/bin/env node
// Copies the items, end time and max raise from config.js into
// apps-script/Code.gs so the page and the backend can't drift apart.
//
//   node tools/sync-script-items.js
//
// Then paste apps-script/Code.gs into the Apps Script editor and redeploy.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const { AUCTION, ITEMS } = require(path.join(root, 'config.js'));
const scriptPath = path.join(root, 'apps-script', 'Code.gs');

const problems = [];
const seen = new Set();
ITEMS.forEach((item, i) => {
    const label = item.name || `item #${i + 1}`;
    if (!item.name) problems.push(`${label}: missing name`);
    if (seen.has(item.name)) problems.push(`${label}: duplicate name`);
    seen.add(item.name);
    if (!Number.isInteger(item.startingBid) || item.startingBid < 1) problems.push(`${label}: startingBid must be a whole number`);
    if (item.quantity !== undefined && (!Number.isInteger(item.quantity) || item.quantity < 1)) problems.push(`${label}: bad quantity`);
    if (item.image && !/^https?:/.test(item.image) && !fs.existsSync(path.join(root, item.image))) problems.push(`${label}: image not found (${item.image})`);
});
if (isNaN(new Date(AUCTION.endTime)) || !/([+-]\d\d:\d\d|Z)$/.test(AUCTION.endTime)) {
    problems.push(`endTime "${AUCTION.endTime}" needs a timezone offset, e.g. 2026-12-06T21:00:00-05:00`);
}
if (problems.length) {
    console.error('Fix these in config.js first:\n  - ' + problems.join('\n  - '));
    process.exit(1);
}

const block = 'const ITEMS = {\n' + ITEMS.map(item =>
    `  ${JSON.stringify(item.name)}: { startingBid: ${item.startingBid}, quantity: ${item.quantity || 1} },`
).join('\n') + '\n};';

let script = fs.readFileSync(scriptPath, 'utf8');
script = script.replace(/(\/\/ ITEMS:START\n)[\s\S]*?(\n\/\/ ITEMS:END)/, (_, a, b) => a + block + b);
script = script.replace(/AUCTION_END_TIME: new Date\('[^']*'\)/, `AUCTION_END_TIME: new Date('${AUCTION.endTime}')`);
script = script.replace(/MAX_RAISE: \d+/, `MAX_RAISE: ${AUCTION.maxRaise}`);
if (AUCTION.siteUrl) script = script.replace(/SITE_URL: '[^']*'/, `SITE_URL: '${AUCTION.siteUrl}'`);
fs.writeFileSync(scriptPath, script);

console.log(`Code.gs updated: ${ITEMS.length} items, closes ${new Date(AUCTION.endTime).toLocaleString('en-US', { timeZone: 'America/New_York' })} Eastern.`);
console.log('Next: paste apps-script/Code.gs into the Apps Script editor and deploy a new version.');
