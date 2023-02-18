const axios = require('axios');
const cheerio = require('cheerio');

const URL = 'https://www.kaldi.co.jp/ec/pro/disp/1/4515996017223?sFlg=2';
// const URL = 'https://www.kaldi.co.jp/ec/pro/disp/1/4515996015359?sFlg=2';

const result = axios(URL)
  .then(response => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('p.price').eq(0).each((x, y) => {
      const place = $(y).text().replace(/(\r\n|\n|\r|)/gm, '').trim();
      console.log('金額：', place);
    })
    const description = [];
    $('.description').find('*').not('style').eq(0).each((i, x) => {
      description.push($(x).text().replace(/(\r\n|\n|\r|)/gm, '').trim());
    })
    const textList = description.filter((x) => x != '');
    const relation_info = [];
    $('#relation_info').find('*').not('style').each((i, x) => {
      relation_info.push($(x).text().replace(/(\r\n|\n|\r|)/gm, '').trim());
    })
    const tableList = relation_info.filter((x) => x != '');
  })
  .catch(err => console.error(err));

