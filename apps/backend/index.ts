import express from 'express';
import cors from 'cors';
import { PreInterviewRequestSchema } from './types';
import { ScrapeGitHubProfile } from './scraper/github';
import { RoomAgentDispatch, RoomConfiguration } from '@livekit/protocol';
import {prisma} from './db';
import {AccessToken } from "livekit-server-sdk"
import 'dotenv/config';
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

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
  res.json({ message: 'Pre-interview data retrieved successfully', data: interview.id });
});

app.post('/api/v1/session', async (req, res) => {
  try {
    const { interviewId } = req.body;

    // 1. Fetch the data we saved in the pre-interview step
    const interviewData = await prisma.interview.findUnique({
      where: { id: interviewId }
    });

    if (!interviewData) {
      return res.status(404).json({ error: "Session not found." });
    }

    // Update status to IN_PROGRESS
    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: "IN_PROGRESS" }
    });

    const githubProfile = typeof interviewData.githubmetadata === 'string'
      ? JSON.parse(interviewData.githubmetadata)
      : interviewData.githubmetadata;

    // 2. Format a system instruction context for the AI Agent
    const instructionPrompt = `
      You are an expert full-stack technical interviewer. Conduct a professional, conversational interactive live audio interview.
      
      CANDIDATE BACKGROUND PROFILE (Scraped via GitHub):
      ${JSON.stringify(githubProfile, null, 2)}
      
      CRITICAL INSTRUCTIONS:
      1. Challenge the candidate technically based strictly on their repositories, tech stack, and codebase styles mentioned above.
      2. Keep responses brief, clear, and focused. Do not lecture. Speak naturally.
      3. Greet them by noting you looked over their GitHub profile, and open with your first specific architectural question.
    `;

    // 3. Provision a unique WebRTC room on your LiveKit Server
    const roomName = `room-${interviewId}`;
    const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
      identity: `candidate-${interviewId}`,
    });
    token.addGrant({ roomJoin: true, room: roomName });

    token.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName:'my-agent' ,
        metadata: JSON.stringify({roomName, instructionPrompt}),
      }),
    ],
  }); 
const jwt= await token.toJwt();

 console.log("jwt token is here", jwt);
 console.log(
  "ended here"
 )
    // 4. Return room connection keys and instruction configurations to launch the background agent
    res.json({
      token:jwt,
      url: process.env.LIVEKIT_URL || "ws://localhost:7880",
      roomName: roomName,
      instructionPrompt: instructionPrompt
    });

  } catch (error) {
    console.error("Session creation failure:", error);
    res.status(500).json({ error: "Could not create interview stream session." });
  }
});

app.get('/api/v1/interview/:id/results', async (req, res) => {
  const resultReport = await prisma.interview.findUnique({
    where: { id: req.params.id },
    include: {
      conversations: true 
    }
  });
  res.json({ data: resultReport });
});


app.listen(4000, () => {
    console.log('Server is running on port 4000');
});