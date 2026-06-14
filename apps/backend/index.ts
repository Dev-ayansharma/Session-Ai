import express from 'express';
import cors from 'cors';
import { PreInterviewRequestSchema } from './types';
import { ScrapeGitHubProfile } from './scraper/github';
const app = express();
app.use(express.json());
app.use(cors(
{
    origin: 'http://localhost:3000',
}
));

app.post('/api/v1/start-interview', async(req, res) => {
    const {success,data} = PreInterviewRequestSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ error: 'Invalid request body' });
    }
    const url = data.githuburl.endsWith("/") ? data.githuburl.slice(0, -1) : data.githuburl;
    const username = url.split('/').pop();
   
    console.log(`Extracted username: ${username}`);
    
    const githubData = await ScrapeGitHubProfile(username || "");
    return res.json({ message: 'Interview started successfully', data: githubData });
});

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});