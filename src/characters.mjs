import cheerio from 'cheerio';

const columns = [
  'no',
  't',
  'name_en',
  'el',
  'style',
  'race',
  'sex',
  'star',
  'hp',
  'atk',
  'em',
  'weapon',
  'voice',
  'released',
  'obtain',
  'title',
];

export default null;
export function parseTable(html) {
  const $ = cheerio.load(html);
  const $tr = $('.sortable tr');

  const characters = [];
  Array.from($tr).forEach((tr) => {
    const $td = $(tr).find('td');
    const chara = {};
    columns.forEach((column, j) => {
      chara[column] = $td.eq(j).text().split('\n')[0].trim();
    });
    if (chara.star) {
      [chara.star] = chara.star.match(/^\d+/);
    }

    if (chara.name_en) {
      characters.push(chara);
    }
  });
  return characters;
}

export function parseExtraData(html) {
  const data = {};

  const $ = cheerio.load(html);
  const $extra = $('div[title="Extra Data"]');
  data.id = $extra.find('th:contains("ID")').eq(0).next().text();
  data.name = $extra.find('th:contains("Name")').eq(0).next().text();

  // TODO:
  // デバフ持ち、奥義加速持ちなどのメタ情報が欲しいため
  // 奥義、アビリティ、サポートスキルの説明文を抽出する
  // const chargeText = $('span:contains("Charge Attack")')
  //   .parent()
  //   .next()
  //   .find('td')
  //   .last()
  //   .text()
  //   .trim();

  return data;
}
