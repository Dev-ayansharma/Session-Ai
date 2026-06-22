import { defineAgent, type JobContext, voice,cli,ServerOptions } from '@livekit/agents'; // <-- Import 'voice' here
import * as google from '@livekit/agents-plugin-google';
import { prisma } from '../db';
import { runPostInterviewAnalysis } from '../analyzer';
import {resolve} from "path"
import 'dotenv/config';
import { fileURLToPath } from 'bun';
console.log("Agent file loaded",import.meta.url);
const file = import.meta.url
console.log("Agent path:", fileURLToPath(import.meta.url));
export default defineAgent({
    entry: async (ctx: JobContext) => {
        console.log("Agent entry point reached");
    
        const metadata = JSON.parse(ctx.job.metadata)
        const room = metadata.roomName;
        const instructionPrompt = metadata.instructionPrompt;
        console.log("Agent session started ", room);
        const interviewId = room.name!.replace("room-", "");

        // Pull the unique instructions generated for this room
        const customInstructions = instructionPrompt || "You are a technical interviewer.";

    const geminiLiveModel = new google.beta.realtime.RealtimeModel({
        model: "gemini-2.5-flash", 
        voice: "Aoede",
        instructions: customInstructions,
        });

        // 2. Instantiate the core voice configurations handler
        const agent = new voice.Agent({
        instructions: customInstructions,
        });

        // 3. Setup the stateful streaming voice agent session container
        const session = new voice.AgentSession({
        llm: geminiLiveModel,
        });

        // 4. Fire the interactive media loop, binding the configurations directly onto your WebRTC room
        await session.start({
        agent,
        room,
        });``
           await ctx.connect()
    
    // --- CHRONOLOGICAL TRANSCRIPT ENGINE ---
    // Use voice.AgentSessionEventTypes enum to guarantee type safety

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (event:any) => {
    // event is of type UserInputTranscribedEvent
    const text = event.transcript;
    
    prisma.message.create({
        data: { 
        message: text, 
        interviewId: interviewId, 
        type: "USER" 
        }
    }).catch(err => console.error("Failed writing candidate turn:", err));
    });

    session.on(voice.AgentSessionEventTypes.SpeechCreated, (event:any) => {
    // event is of type SpeechCreatedEvent
    const text = event.text;

    prisma.message.create({
        data: { 
        message: text, 
        interviewId: interviewId, 
        type: "ASSISTANT" 
        }
    }).catch(err => console.error("Failed writing interviewer turn:", err));
    });

        // --- CONVERSATION TERMINATION ---
        room.on("disconnected", async () => {
        console.log(`Candidate left the room. Processing feedback for Interview ID: ${interviewId}`);
        
        await prisma.interview.update({
            where: { id: interviewId },
            data: { status: "COMPLETED" }
        });

        await runPostInterviewAnalysis(interviewId);
        
        await session.close();
        });

    }
    });


cli.runApp(new ServerOptions({ agent: fileURLToPath(file), agentName: 'my-agent' }));