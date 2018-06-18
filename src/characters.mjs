import cheerio from 'cheerio';

const columns = [
  'no',
  'rarity',
  'name_wiki',
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

    if (chara.name_wiki) {
      characters.push(chara);
    }
  });
  return characters;
}

export function parseDetail(html) {
  const $ = cheerio.load(html);
  const $header = $('.char-header');
  const $stats = $('div[title="Stats"]');
  const $extra = $('div[title="Extra Data"]');

  const getImgAlt = (th, regexp) => {
    const $img = $stats.find(th).eq(0).next().find('img');

    // e.g:
    // "Label Element Water.png" -> "Water"
    // "Label Weapon Sabre.png" "Label Weapon Katana.png" -> "Sabre,Katana"
    return [].slice.call($img).reduce((labels, img) => {
      const matched = $(img).attr('alt').match(regexp);
      if (matched) {
        labels.push(matched[1]);
      }
      return labels;
    }, []).join(',');
  };

  /* eslint-disable camelcase */
  const id = $extra.find('th:contains("ID")').eq(0).next().text();
  const char_id = $extra.find('th:contains("Char ID")').eq(0).next().text();
  const rarity = $header.find('.char-rarity img').attr('alt').match(/Rarity (\w+).png/)[1];
  const title = $extra.find('th:contains("Title")').eq(0).next().text();
  const title_en = $header.find('.char-title').text().match(/([\w ]+)/)[1];
  const name = $extra.find('th:contains("Name")').eq(0).next().text();
  const name_en = $header.find('.char-name').eq(0).text();
  const element = getImgAlt('th:contains("Element")', /Label Element (\w+).png/);
  let style = getImgAlt('th:contains("Style")', /Label Type (\w+).png/);
  const race = getImgAlt('th:contains("Race")', /Label Race (\w+).png/);
  const gender = $stats.find('th:contains("Gender")').next().text();
  const star = String($extra.find('th:contains("Uncap Limit")').next().find('img').length);

  // "8290 / 9850" => "9850"
  const hp = $stats.find('th:contains("MAX HP")').next().text().match(/(?:\d+ \/ )?(\d+)/)[1].trim();
  const atk = $stats.find('th:contains("MAX ATK")').next().text().match(/(?:\d+ \/ )?(\d+)/)[1].trim();

  const em = $('th:contains("Extended Mastery Perks")').length ? 'Yes' : 'No';
  const specialty = getImgAlt('th:contains("Specialty")', /Label Weapon (\w+).png/);
  const voice = $extra.find('th:contains("Voice Actor")').next().text().trim();
  const voice_en = $stats.find('th:contains("Voice Actor")').next().text().trim();
  const released = $extra.find('th:contains("Release Date")').next().text();
  const obtain = $('th:contains("How to Recruit")').parent().next().text()
    .trim();
  /* eslint-enable camelcase */

  // fix alt typo
  if (style === 'Balance') {
    style = 'Balanced';
  }

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

  return {
    id,
    char_id,
    rarity,
    title,
    title_en,
    name,
    name_en,
    element,
    style,
    race,
    gender,
    star,
    hp,
    atk,
    em,
    specialty,
    voice,
    voice_en,
    released,
    obtain,
  };
}
