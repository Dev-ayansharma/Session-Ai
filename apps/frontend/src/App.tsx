
import { useState } from "react";
import "../styles/globals.css";
import { Form } from "./components/Form";
import { Interview } from "./components/Interview";
import { Result } from "./components/Result";
import { Toaster } from "sonner";
import  {BrowserRouter,Routes,Route} from "react-router"

export function App() {
  const [page, setPage] = useState<"form" | "interview" | "result">("form");

  return (
    <div>
      <BrowserRouter>
      <Routes>
        
        <Route path="/form" element={<Form />} />
        <Route path="/interview/:interviewId" element={<Interview />} />
        <Route path="/result/:interviewId" element={<Result />} />
      </Routes>
      </BrowserRouter>
 
     <Toaster position="bottom-left" />  
    </div>
  );
} 
 