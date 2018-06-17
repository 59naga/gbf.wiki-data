import request from 'request';
import Promise from 'bluebird';

import fs from 'fs';
import path from 'path';
import { parseTable, parseDetail } from './src/characters';

const requestPromise = Promise.promisify(request, { multiArgs: true });
async function localize(chara) {
  const url = `https://gbf.wiki/${encodeURIComponent(chara.name_wiki)}`;
  const html = await requestPromise(url);
  const data = parseDetail(html.toString());

  return Object.assign({}, chara, data);
}

const dirname = path.dirname(new URL(import.meta.url).pathname);
async function task(inputName, outputName) {
  const input = `${dirname}/test/fixtures/${inputName}.html`;
  const output = `./dist/${outputName}.json`;
  const characters = parseTable(fs.readFileSync(input));

  let i = 0;
  console.log(`start ${characters.length} data parsing from`, input);
  const localizedCharacters = await Promise.map(
    characters, chara =>
      localize(chara)
        .then(((localizedData) => {
          console.log(`progress ${++i}/${characters.length}`, localizedData.id, localizedData.rarity, localizedData.name, localizedData.specialty);
          return localizedData;
        }))
        .catch((error) => {
          console.log('failed', chara.name_wiki, error.message, 'abort');
          return chara;
        })
    , { concurrency: 10 },
  );

  fs.writeFileSync(output, JSON.stringify(localizedCharacters, null, 2));
  console.log('completed', localizedCharacters.length, 'data to', output);

  return output;
}

async function main() {
  const fileNames = [];

  fileNames.push(await task('2018-05-31', '2018-05-31'));
  fileNames.push(await task('2018-05-30', '2018-05-30'));
  // fileNames.push('./dist/2018-05-31.json');
  // fileNames.push('./dist/2018-05-30.json');

  const characters = fileNames.reduce(
    ((data, filename) =>
      data.concat(JSON.parse(fs.readFileSync(filename)))
    ), [],
  );

  // sort by released desc, rarity desc, name asc
  characters.sort((a, b) => {
    if (a.released === b.released) {
      if (a.rarity === b.rarity) {
        if (a.name === b.name) {
          return 0;
        }
        return a.name < b.name ? -1 : 1;
      }
      return a.rarity < b.rarity ? 1 : -1;
    }
    return a.released < b.released ? 1 : -1;
  });

  fs.writeFileSync('./dist/characters.json', JSON.stringify(characters));
}

main();
