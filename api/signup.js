import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { username, password } = req.body;

        try {
            const client = await MongoClient.connect(process.env.MONGO_URI);
            const db = client.db();
            const existingUser = await db.collection('users').findOne({ username });

            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = { username, password: hashedPassword };

            await db.collection('users').insertOne(newUser);
            res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
}
