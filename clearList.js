// node clearList.js api/easy.json
const fs = require('fs');

const [, , fileName] = process.argv;

const json = fs.readFileSync(fileName, 'utf-8');
const words = JSON.parse(json);

const clearedWords = words.filter((word, i) => words.indexOf(word) === i).sort((a, b) => a.localeCompare(b));

const clearedWordsJson = JSON.stringify(clearedWords);

fs.writeFileSync(fileName, clearedWordsJson, 'utf-8');
