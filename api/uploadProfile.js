import { MongoClient } from 'mongodb';
import multer from 'multer';
import nextConnect from 'next-connect';

const upload = multer({ storage: multer.memoryStorage() });

const handler = nextConnect();
handler.use(upload.fields([{ name: 'profilePicture' }, { name: 'backgroundPicture' }]));

handler.post(async (req, res) => {
    const { username, description, projects, languages } = req.body;

    const profilePicture = req.files.profilePicture[0];
    const backgroundPicture = req.files.backgroundPicture[0];

    const profilePicURL = `/uploads/${profilePicture.filename}`;
    const backgroundPicURL = `/uploads/${backgroundPicture.filename}`;

    try {
        const client = await MongoClient.connect(process.env.MONGO_URI);
        const db = client.db();
        const user = await db.collection('users').findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update profile information
        await db.collection('users').updateOne({ username }, {
            $set: {
                profilePicture: profilePicURL,
                banner: backgroundPicURL,
                description,
                projects: projects.split(','),
                languages: languages.split(',')
            }
        });

        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default handler;
