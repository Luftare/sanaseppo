const fs = require('fs');
const convert = require('xml-js');

const xml = fs.readFileSync('./kotus-sanalista_v1.xml', 'utf-8');

const result = convert.xml2json(xml, { compact: true, spaces: 4 });

// fs.writeFileSync('raw.json', result);
// console.log(result);
const data = JSON.parse(result);

const words = data['kotus-sanalista'].st.filter((v, i) => !v.t).map((v) => v.s._text);
fs.writeFileSync('api/words.json', JSON.stringify(words));
// console.log(words);