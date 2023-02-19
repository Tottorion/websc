const http = require('http');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config({
	path: path.resolve(__dirname, '../.env')
});

// 設定値
const URL = 'https://www.kaldi.co.jp/ec/pro/disp/1/4515996017223?sFlg=2';
const token = process.env.NOTION_KEY
const databaseId = process.env.NOTION_DATABASE_ID
const pageId = '49d0f9d6968f41619857b5d139536fcf'
const blockId = 'b086c0b7-7649-4ae8-8c31-3ae7bc842c7c'

axios(URL).then(response => {
	const html = response.data;
	const $ = cheerio.load(html);
	const res = {
		price: '',
		description: '',
		relationInfo: '',
	}
	// 名前プロパティー用
	const titleList = [];
	$('h1.headline').eq(0).each((x, y) => {
		titleList.push($(y).text().replace(/(\r\n|\n|\r|)/gm, '').trim());
	})
	res.title = titleList[0];

	// 値段プロパティー用
	const priceList = [];
	$('p.price strong').eq(0).each((x, y) => {
		priceList.push($(y).text().replace(/(\r\n|\n|\r|)/gm, '').trim().match(/\d+/g).join(''));
	})
	res.price = priceList[0];

	// コンテンツのテキスト用
	const descriptionList = [];
	$('.description').find('*').not('style').eq(0).each((i, x) => {
		descriptionList.push($(x).text().replace(/(\r\n|\n|\r|)/gm, '').trim())
	})
	res.description = descriptionList[0].replace(/。/g, '。\n');

	// コンテンツのテーブル用
	const relationInfoLaw = [];
	$('#relation_info').eq(1).find('th, td').not('style').each((i, x) => {
		relationInfoLaw.push($(x).text().replace(/(\r\n|\n|\r|)/gm, '').trim());
	}).filter((x) => x !== '')
	// [[0,1][2,3][4,5]]の形に構築
	const relationInfo = [];
	for (let i = 0; i < relationInfoLaw.length; i += 2) {
		relationInfo.push([relationInfoLaw[i], relationInfoLaw[i + 1]])
	}
	res.relationInfo = relationInfo

	// まずはDatabase配下に新しいページを追加する。
	createPage(res);
})
	.catch(err => console.error(err));

async function createPage(contents) {
	const requestData = {
		parent: {
			database_id: databaseId
		},
		properties: {
			'名前': {
				title: [{
					text: { content: contents.title, link: null },
					plain_text: contents.title,
				}]
			},
			'状態': {
				select: {
					name: '焙煎豆',
				}
			},
			'購入店': {
				multi_select: [{
					name: 'KALDI',
				}]
			},
			'値段': {
				"number": Number(contents.price)
			}
		},
	}
	const response = await axios.post('https://api.notion.com/v1/pages',
		requestData, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'Notion-Version': '2022-06-28', // 2023年2月時点
			'Content-Type': 'application/json',
		},
	}).catch((error) => {
		//接続に失敗した場合の処理
		console.log('err', error);
	});
	// データが登録できた場合
	if (response && response.data) {
		// さらにブロックの内容を追加していく。
		createPageDetail(contents, response.data.id);
	}
};

async function createPageDetail(contents, blockId) {
	// テーブルの中身を構築
	const relationInfoTable = contents.relationInfo.map((x) => {
		return {
			"type": "table_row",
			"table_row": {
				cells: [[{
					text: { content: x[0] },
					plain_text: x[0],
				}],
				[{
					text: { content: x[1] },
					plain_text: x[1],
				}]
				]
			}
		}
	})

	const requestData = {
		children: [{
			// 段落
			"type": "paragraph",
			"paragraph": {
				"rich_text": [{
					"text": { "content": contents.description }
				}],
			}
		},
		{
			// テーブル
			"type": "table",
			"table": {
				"table_width": 2,
				"has_column_header": false,
				"has_row_header": false,
				"children": relationInfoTable
			}
		}]
	}
	await axios.patch('https://api.notion.com/v1/blocks/' + blockId + '/children',
		requestData, {
		headers: {
			'Authorization': `Bearer ${token}`,
			'Notion-Version': '2022-06-28', // 2023年2月時点
			'Content-Type': 'application/json',
		},
	}).catch((error) => {
		//接続に失敗した場合の処理
		console.log('err', error);
	});
}

async function getDatabase(databaseId) {
	const response = await axios({
		method: 'post',
		url: 'https://api.notion.com/v1/databases/' + databaseId + '/query',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Notion-Version': '2022-06-28', // 2023年2月時点
			'Content-Type': 'application/json',
		},
	}).catch((error) => {
		//接続に失敗した場合の処理
		console.log('err', error);
	});
	// データ1件以上取得できた場合
	if (response && response.data) {
		// 取得したテーブルデータを使った処理を記述
		console.log('**********************');
		console.log(response.data);
		console.log('**********************');
	}
};


async function getPage(pageId) {
	const response = await axios({
		method: 'get',
		url: 'https://api.notion.com/v1/pages/' + pageId,
		headers: {
			'Authorization': `Bearer ${token}`,
			'Notion-Version': '2022-06-28', // 2023年2月時点
			'Content-Type': 'application/json',
		},
	}).catch((error) => {
		//接続に失敗した場合の処理
		console.log('err', error);
	});
	// データ1件以上取得できた場合
	if (response && response.data) {
		console.log('**********************');
		console.dir(response.data, { depth: null });
		console.log('**********************');
	}
};
// getPage(pageId)

async function getBlock(blockId) {
	const response = await axios({
		method: 'get',
		url: 'https://api.notion.com/v1/blocks/' + blockId + '/children',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Notion-Version': '2022-06-28', // 2023年2月時点
			'Content-Type': 'application/json',
		},
	}).catch((error) => {
		//接続に失敗した場合の処理
		console.log('err', error);
	});
	// データ1件以上取得できた場合
	if (response && response.data) {
		console.log('**********************');
		console.dir(response.data, { depth: null });
		console.log('**********************');
	}
};

// { 通常テキストブロック
// 	object: 'block',
// 		id: 'e1c5068a-2679-4062-8cfe-e5813e7b2d69',
// 			parent: {
// 		type: 'page_id',
// 			page_id: '49d0f9d6-968f-4161-9857-b5d139536fcf'
// 	},
// 	created_time: '2023-02-15T12:24:00.000Z',
// 		last_edited_time: '2023-02-15T12:24:00.000Z',
// 			created_by: { object: 'user', id: 'd6141ced-4f83-4438-8458-e91856113be7' },
// 	last_edited_by: { object: 'user', id: 'd6141ced-4f83-4438-8458-e91856113be7' },
// 	has_children: false,
// 		archived: false,
// 			type: 'paragraph',
// 				paragraph: {
// 		rich_text: [
// 			{
// 				type: 'text',
// 				text: {
// 					content: '※先着配布の限定袋はなくなり次第終了いたします。終了後は、スペシャルブレンド等と同じ通常パッケージでのお届けとなります。',
// 					link: null
// 				},
// 				annotations: {
// 					bold: false,
// 					italic: false,
// 					strikethrough: false,
// 					underline: false,
// 					code: false,
// 					color: 'default'
// 				},
// 				plain_text: '※先着配布の限定袋はなくなり次第終了いたします。終了後は、スペシャルブレンド等と同じ通常パッケージでのお届けとなります。',
// 				href: null
// 			}
// 		],
// 			color: 'default'
// 	}
// },
// { テーブルブロック
// 	object: 'block',
// 		id: 'b086c0b7-7649-4ae8-8c31-3ae7bc842c7c',
// 			parent: {
// 		type: 'page_id',
// 			page_id: '49d0f9d6-968f-4161-9857-b5d139536fcf'
// 	},
// 	created_time: '2023-02-15T12:27:00.000Z',
// 		last_edited_time: '2023-02-15T12:27:00.000Z',
// 			created_by: { object: 'user', id: 'd6141ced-4f83-4438-8458-e91856113be7' },
// 	last_edited_by: { object: 'user', id: 'd6141ced-4f83-4438-8458-e91856113be7' },
// 	has_children: true,
// 		archived: false,
// 			type: 'table',
// 				table: {
// 		table_width: 2,
// 			has_column_header: false,
// 				has_row_header: false
// 	}
// },
// {
// 	object: 'block',
// 		id: 'f8a39857-85f3-490c-a653-7b7df3d05076',
// 			parent: {
// 		type: 'block_id',
// 			block_id: 'b086c0b7-7649-4ae8-8c31-3ae7bc842c7c'
// 	},
// 	created_time: '2023-02-15T12:27:00.000Z',
// 		last_edited_time: '2023-02-15T12:27:00.000Z',
// 			created_by: { object: 'user', id: 'd6141ced-4f83-4438-8458-e91856113be7' },
// 	last_edited_by: { object: 'user', id: 'd6141ced-4f83-4438-8458-e91856113be7' },
// 	has_children: false,
// 		archived: false,
// 			type: 'table_row',
// 				table_row: {
// 		cells: [
// 			[
// 				{
// 					type: 'text',
// 					text: { content: '名称（品名）', link: null },
// 					annotations: {
// 						bold: false,
// 						italic: false,
// 						strikethrough: false,
// 						underline: false,
// 						code: false,
// 						color: 'default'
// 					},
// 					plain_text: '名称（品名）',
// 					href: null
// 				}
// 			],
// 			[
// 				{
// 					type: 'text',
// 					text: { content: 'レギュラーコーヒー', link: null },
// 					annotations: {
// 						bold: false,
// 						italic: false,
// 						strikethrough: false,
// 						underline: false,
// 						code: false,
// 						color: 'default'
// 					},
// 					plain_text: 'レギュラーコーヒー',
// 					href: null
// 				}
// 			]
// 		]
// 	}
// },
// { ページのプロパティー
// 	object: 'page',
// 		id: '49d0f9d6-968f-4161-9857-b5d139536fcf',
// 			created_time: '2023-02-15T12:19:00.000Z',
// 				last_edited_time: '2023-02-15T12:27:00.000Z',
// 					created_by: { object: 'user', id: 'd6141ced-4f83-4438-8458-e91856113be7' },
// 	last_edited_by: { object: 'user', id: 'd6141ced-4f83-4438-8458-e91856113be7' },
// 	cover: null,
// 		icon: null,
// 			parent: {
// 		type: 'database_id',
// 			database_id: 'dc37cd50-12d1-429d-b530-71126067bf51'
// 	},
// 	archived: false,
// 		properties: {
// 		'購入店': {
// 			id: '%3E~%7CY',
// 				type: 'multi_select',
// 					multi_select: [
// 						{
// 							id: '81d39551-8ee9-476b-9f95-18c2a48ed1bd',
// 							name: 'KALDI',
// 							color: 'purple'
// 						}
// 					]
// 		},
// 		'値段': { id: '%40SBW', type: 'number', number: 950 },
// 		'ロースト': {
// 			id: 'KHfF',
// 				type: 'multi_select',
// 					multi_select: [
// 						{
// 							id: '0a2847f0-b371-4d66-a2a9-5e64d33e9f76',
// 							name: '深煎り',
// 							color: 'brown'
// 						}
// 					]
// 		},
// 		'購入グラム': { id: 'OZa_', type: 'number', number: 200 },
// 		'生産国': {
// 			id: 'T%5C%40%7C',
// 				type: 'multi_select',
// 					multi_select: [
// 						{
// 							id: '4d2a1005-2e4f-4ce5-86a9-1843d6dd6cce',
// 							name: 'ラオス',
// 							color: 'gray'
// 						},
// 						{
// 							id: 'fee7a9d5-653e-46b2-a317-2629675cae44',
// 							name: 'ブラジル',
// 							color: 'green'
// 						}
// 					]
// 		},
// 		'種類': {
// 			id: 'Xqfu',
// 				type: 'multi_select',
// 					multi_select: [
// 						{
// 							id: '8c638b99-a5c7-4104-ab73-613ad44bf64c',
// 							name: 'ブレンド',
// 							color: 'yellow'
// 						}
// 					]
// 		},
// 		'円/g': {
// 			id: 'dydP',
// 				type: 'formula',
// 					formula: { type: 'number', number: 4.75 }
// 		},
// 		'状態': {
// 			id: 'fAvD',
// 				type: 'select',
// 					select: {
// 				id: '0d72e139-423f-4a8d-88dc-256f6c3ead84',
// 					name: '焙煎豆',
// 						color: 'yellow'
// 			}
// 		},
// 		'購入日': {
// 			id: 'rv%40H',
// 				type: 'date',
// 					date: { start: '2023-02-11', end: null, time_zone: null }
// 		},
// 		'名前': {
// 			id: 'title',
// 				type: 'title',
// 					title: [
// 						{
// 							type: 'text',
// 							text: { content: "KALDI'Sエンジェル", link: null },
// 							annotations: {
// 								bold: true,
// 								italic: false,
// 								strikethrough: false,
// 								underline: false,
// 								code: false,
// 								color: 'default'
// 							},
// 							plain_text: "KALDI'Sエンジェル",
// 							href: null
// 						}
// 					]
// 		}
// 	},
// 	url: 'https://www.notion.so/KALDI-S-49d0f9d6968f41619857b5d139536fcf'
// }
// **********************