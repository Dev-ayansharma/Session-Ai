import {Input} from "../components/ui/input";
import {Button} from "../components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";
import  {BACKEND_URL} from "../lib/config"
import { useNavigate } from "react-router";
export function Form() {
    const [githuburl, setGithubUrl] =useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    async function handleSubmit() {
        if(!githuburl) {
            toast("Please enter your GitHub profile URL");
            return;
        }
         setLoading(true);


       const response = await axios.post(`${BACKEND_URL}/api/v1/pre-interview`, { githuburl });
        toast("Pre-interview data retrieved successfully!");
        
        navigate(`/interview/${response.data.data}`);
        setLoading(false);
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
        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? "Starting Interview..." : "Start Interview"}
        </Button>
      </div>
        </div>
    </div>
  );
}
