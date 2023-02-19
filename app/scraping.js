const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.kaldi.co.jp/ec/pro/disp/1/4515996017223?sFlg=2';
// const URL = 'https://www.kaldi.co.jp/ec/pro/disp/1/4515996015359?sFlg=2';

const result = axios(URL)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);
    return $

    // 値段プロパティー用
    const priceList = [];
    $('p.price strong').eq(0).each((x, y) => {
      priceList.push($(y).text().replace(/(\r\n|\n|\r|)/gm, '').trim().match(/\d+/g).join(''));
    })
    const price = priceList[0];

    // コンテンツのテキスト用
    const descriptionList = [];
    $('.description').find('*').not('style').eq(0).each((i, x) => {
      descriptionList.push($(x).text().replace(/(\r\n|\n|\r|)/gm, '').trim())
    })
    const description = descriptionList[0].replace(/。/g, '。\n');

    // コンテンツのテーブル用
    const relationInfoLaw = [];
    $('#relation_info').eq(1).find('th, td').not('style').each((i, x) => {
      relationInfoLaw.push($(x).text().replace(/(\r\n|\n|\r|)/gm, '').trim());
    }).filter((x) => x !== '')

    const relationInfo = [];
    for (let i = 0; i < relationInfoLaw.length; i += 2) {
      relationInfo.push([relationInfoLaw[i], relationInfoLaw[i + 1]])
    }
    return relationInfo
  })
  .catch(err => console.error(err));

console.log(result)