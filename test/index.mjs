import assert from 'assert';
import path from 'path';
import fs from 'fs';
import _find from 'lodash.find';
import { parseTable, parseDetail } from '../src/characters';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const fixtures = {
  characters: `${dirname}/fixtures/2018-05-30.html`,
  jeanne: `${dirname}/fixtures/jeanne.html`,
  toru_amuro: `${dirname}/fixtures/toru_amuro.html`,
  yodarha: `${dirname}/fixtures/yodarha.html`,
};

describe('characters', () => {
  describe('.parseTable', () => {
    const characters = parseTable(fs.readFileSync(fixtures.characters).toString());

    it('壊れたデータが無く、SSRジャンヌがobject内に有る', () => {
      const fault = _find(characters, data => _find(data, value => value.length === 0));
      if (fault) {
        throw new Error(`found fault data: ${JSON.stringify(fault)}`);
      }
      assert(characters.length > 450);

      // SSRジャンヌの確認
      const jeanne = _find(characters, data => (
        data.rarity === 'SSR' && data.name_wiki === "Jeanne d'Arc"
      ));
      assert(jeanne);
    });
  });
  describe('.parseDetail', () => {
    it('日本語情報を取得できている', () => {
      const data = parseDetail(fs.readFileSync(fixtures.jeanne).toString());

      assert(data.id === '3040040000');
      assert(data.title_en === 'Holy Maiden');
      assert(data.name === 'ジャンヌダルク');
    });
  });
});

describe('issues', () => {
  const data = JSON.parse(fs.readFileSync('./dist/chars.json').toString());

  it('#1', () => {
    const yoda = _find(data, item => item.name_wiki === 'Yodarha');
    assert(yoda.specialty === 'Sabre,Katana');
  });
  it('#2', () => {
    const ssrSoriz = _find(data, item => item.name_wiki === 'Soriz (SSR)');
    assert(ssrSoriz.specialty === 'Melee');

    const srLeona = _find(data, item => item.name_wiki === 'Leona');
    assert(srLeona.specialty === 'Spear');
  });
});
