const path = require('path');
const axios = require('axios');
require('dotenv').config({
	path: path.resolve(__dirname, '../.env')
});

const token = process.env.NOTION_KEY
const databaseId = process.env.NOTION_DATABASE_ID
// const pageId = '49d0f9d6968f41619857b5d139536fcf'
const pageId = 'b086c0b7-7649-4ae8-8c31-3ae7bc842c7c'

// getDatabase(databaseId);
getPage(pageId);

async function getDatabase(databaseId) {
	const response = await axios({
		method: 'post',
		url: 'https://api.notion.com/v1/databases/' + databaseId + '/query',
		headers: {
			'Authorization': `Bearer ${token}`,
			'Notion-Version': '2021-08-16', // 2022年7月時点 必要に応じて変更してください
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
		url: 'https://api.notion.com/v1/blocks/' + pageId + '/children',
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