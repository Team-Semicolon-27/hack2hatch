import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Document } from 'mongoose';
import { MentorModel } from '@/model/model';
import { NotionModel } from '@/model/model';

interface Mentor extends Document {
    email: string;
    notionsPartOf: string[];
}

interface Notion extends Document {
    mentors: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { id } = req.query as { id: string };
    const session = await getSession({ req }); 

    if (!session) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        const mentor = await MentorModel.findOne({ email: session.user.email }) as Mentor;
        
        if (!mentor) {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        const notion = await NotionModel.findById(id) as Notion;
        
        if (!notion) {
            return res.status(404).json({ message: 'Notion not found' });
        }

        if (!notion.mentors.includes(mentor.id.toString())) {
            notion.mentors.push(mentor.id.toString());
        }

        if (!mentor.notionsPartOf.includes(notion.id.toString())) {
            mentor.notionsPartOf.push(notion.id.toString());
        }

        await Promise.all([notion.save(), mentor.save()]);

        return res.status(200).json({ message: 'Successfully joined notion as mentor' });
    } catch (error) {
        console.error('Error joining notion:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}