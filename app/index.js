const path = require('path');
require('dotenv').config({
	path: path.resolve(__dirname, '../.env')
});
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

try {
	const myPage = notion.databases.create({
		database_id: databaseId,
	})
	console.log(myPage);

} catch (error) {
	console.error(error.body)
}
