import {Input} from "../components/ui/input";
import {Button} from "../components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import  {BACKEND_URL} from "../lib/config"
export function Form() {
    const [githuburl, setGithubUrl] =useState("");
    async function handleSubmit() {
        if(!githuburl) {
            toast("Please enter your GitHub profile URL");
            return;
        }

        await axios.post(`${BACKEND_URL}/api/v1/start-interview`, { githuburl })
        toast("Interview started successfully!");
    }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div>
             <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
      Ai Interview
    </h2>
      <div className="p-4">
        <Input 
          placeholder="Enter your GitHub profile URL" 
          value={githuburl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
      </div>
      <div className = "flex justify-center p-4">
        <Button onClick={handleSubmit}>Start Interview</Button>
      </div>
        </div>
    </div>
  );
}
