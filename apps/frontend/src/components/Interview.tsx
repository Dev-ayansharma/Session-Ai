import { BACKEND_URL } from "@/lib/config";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { LiveKitRoom, RoomAudioRenderer, VoiceAssistantControlBar } from "@livekit/components-react";

interface SessionData {
  token: string;
  url: string;
  roomName: string;
  instructionPrompt: string;
}

export function Interview() {
  const { interviewId } = useParams();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);

  useEffect(() => {
    if (!interviewId) return;

    async function fetchSessionToken() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/session`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ interviewId }),
        });
        
        const data: SessionData = await response.json();
        setSessionData(data);
      } catch (error) {
        console.error("Failed to fetch interview session metadata:", error);
      }
    }

    fetchSessionToken();
  }, [interviewId]);

  if (!sessionData) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">
        <p className="text-zinc-400 animate-pulse">Initializing interview session audio environment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-950 text-white gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">AI Technical Interview</h1>
        <p className="text-zinc-400 text-sm mt-1">Room: {sessionData.roomName}</p>
      </div>

      <LiveKitRoom
        video={false}
        audio={true}
        token={sessionData.token}         
        serverUrl={sessionData.url}         
        connect={true}
        data-lk-theme="default"
        className="flex flex-col items-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full"
      >
        <div className="my-8 flex items-center justify-center h-24 w-24 rounded-full bg-indigo-600/10 border border-indigo-500/20 animate-pulse">
          <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>

        {/* Plays the audio stream from Gemini */}
        <RoomAudioRenderer />

        {/* UI interaction bar for mic mute/unmute & connection states */}
        <VoiceAssistantControlBar />
      </LiveKitRoom>
    </div>
  );
}