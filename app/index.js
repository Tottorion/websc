const path = require('path');
const axios = require('axios');
require('dotenv').config({
	path: path.resolve(__dirname, '../.env')
});
const { Client } = require('@notionhq/client');

const token = process.env.NOTION_KEY
const databaseId = process.env.NOTION_DATABASE_ID
const pageId = process.env.NOTION_ITEM_ID

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
		for (const data of response.data.results) {
			// 取得したテーブルデータを使った処理を記述
			console.log('**********************');
			console.log(data);
			console.log('**********************');
		}
	}
};

async function getPage(pageId) {
	const response = await axios({
		method: 'post',
		url: 'https://api.notion.com/v1/pages/' + pageId,
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
		console.log('**********************');
		console.log(response.data);
		console.log('**********************');
	}
};
