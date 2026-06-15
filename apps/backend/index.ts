import express from 'express';
import cors from 'cors';
import { PreInterviewRequestSchema } from './types';
import { ScrapeGitHubProfile } from './scraper/github';
import {prisma} from './db';
const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/v1/pre-interview', async(req, res) => {
    const {success,data} = PreInterviewRequestSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: 'Invalid request body' });
    }
    const url = data.githuburl.endsWith("/") ? data.githuburl.slice(0, -1) : data.githuburl;
    const username = url.split('/').pop();
   
    console.log(`Extracted username: ${username}`);
    
    const githubData = await ScrapeGitHubProfile(username || "");
    const interview = await prisma.interview.create({
        data:{
            githubmetadata: JSON.stringify(githubData),
            status: "PRE",

        }
    })
    return res.json({ message: 'Pre-interview data retrieved successfully', data: interview.id });
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});