
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'LibraryDB';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
    if (cachedClient && cachedDb) {
        return { client: cachedClient, db: cachedDb };
    }

    if (!uri) {
        throw new Error('MONGODB_URI tanımlanmamış!');
    }

    const client = await MongoClient.connect(uri);
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;
    return { client, db };
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Sadece POST isteği kabul edilir' });
    }

    try {
        const { action, collection, body } = req.body;
        const { db } = await connectToDatabase();
        const col = db.collection(collection);

        let result;
        switch (action) {
            case 'find':
                const documents = await col.find(body.filter || {}).toArray();
                result = { documents };
                break;
            case 'insertOne':
                result = await col.insertOne(body.document);
                break;
            case 'updateOne':
                result = await col.updateOne(body.filter, body.update);
                break;
            case 'deleteOne':
                result = await col.deleteOne(body.filter);
                break;
            default:
                return res.status(400).json({ message: 'Geçersiz eylem' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('MongoDB API Hatası:', error);
        res.status(500).json({ error: error.message });
    }
}
