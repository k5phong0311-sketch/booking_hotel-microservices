const fs = require('fs');

const b64File = process.argv[2];
const targetFile = process.argv[3];

if (!targetFile || !b64File) {
  console.error("Usage: node save.js <b64File> <targetFile>");
  process.exit(1);
}

const base64Data = fs.readFileSync(b64File, 'utf8').replace(/\s/g, '');
const content = Buffer.from(base64Data, 'base64').toString('utf8');
fs.writeFileSync(targetFile, content, 'utf8');
console.log(`Saved ${targetFile} successfully.`);
