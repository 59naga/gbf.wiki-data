import assert from 'assert';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import { parseTable, parseExtraData } from '../src/characters';

const dirname = path.dirname(new URL(import.meta.url).pathname);
const fixtures = {
  characters: `${dirname}/fixtures/2018-05-30.html`,
  jeanne: `${dirname}/fixtures/jeanne.html`,
  toru_amuro: `${dirname}/fixtures/toru_amuro.html`,
};

describe('characters', () => {
  describe('.parseTable', () => {
    const characters = parseTable(fs.readFileSync(fixtures.characters).toString());
    const jeanne = _.find(characters, data => (
      data.t === 'SSR' && data.name_en.match(/^Jeanne/)
    ));

    it('壊れたデータが無く、SSRジャンヌがobject内に有る', () => {
      const fault = _.find(characters, data => (
        _.find(data, value => value.length === 0)
      ));
      if (fault) {
        throw new Error(`found fault data: ${JSON.stringify(fault)}`);
      }
      assert(characters.length > 450);

      // SSRジャンヌの確認
      assert(jeanne.t === 'SSR');
      assert(jeanne.name_en === "Jeanne d'Arc");
    });
  });
  describe('.parseExtraData', () => {
    it('日本語情報を取得できている', () => {
      const data = parseExtraData(fs.readFileSync(fixtures.jeanne).toString());

      assert(data.id === '3040040000');
      assert(data.name === 'ジャンヌダルク');
    });
    it('安室透でパースが失敗することがあった(再現不能)', () => {
      const data = parseExtraData(fs.readFileSync(fixtures.toru_amuro).toString());

      assert(data.id === '3030238000');
      assert(data.name === '安室透');
    });
  });
});
