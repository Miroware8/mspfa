import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.DB_HOST, {
	useUnifiedTopology: true
});
client.connect();
export const db = client.db('mspfa');