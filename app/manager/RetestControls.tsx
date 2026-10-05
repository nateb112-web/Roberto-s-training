"use client";
import {useEffect,useState} from "react";

type Attempt={number:number;score:number;passed:boolean;date:string};
type ExamState={attempts:Attempt[];locked:boolean;retestState:"none"|"released"|"approval"};
export default function RetestControls(){
 const [state,setState]=useState<ExamState>({attempts:[{number:1,score:67,passed:false,date:"Today"}],locked:true,retestState:"none"});
 const [msg,setMsg]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem("robertos-final-exam");if(raw)setState(JSON.parse(raw))}catch{}},[]);
 function setRetest(mode:"released"|"approval"){
   const next={...state,locked:true,retestState:mode}; setState(next); localStorage.setItem("robertos-final-exam",JSON.stringify(next));
   setMsg(mode==="released"?"Retest released — employee can begin now.":"Retest assigned — manager approval required before it begins.");
 }
 function approve(){
   const next={...state,locked:true,retestState:"released" as const}; setState(next); localStorage.setItem("robertos-final-exam",JSON.stringify(next)); setMsg("Manager approval granted — retest is now available.");
 }
 const last=state.attempts.at(-1);
 return <section className="card retestpanel"><div className="section-title"><h2>Quiz Retests</h2><span className="muted">Manager controls</span></div>
 <div className="retestrow"><div><strong>Employee — Final Server Exam</strong><div className="muted">{last?(last.passed?"Passed":"Failed")+" Attempt "+last.number+" • "+last.score+"%":"No attempts yet"}</div>{state.attempts.length>0&&<small>{state.attempts.length} total attempt{state.attempts.length===1?"":"s"} recorded</small>}</div>
 <div className="retestactions"><button className="outline" onClick={()=>setRetest("released")}>Retest — No Approval</button><button onClick={()=>setRetest("approval")}>Retest — Manager Approval</button>{state.retestState==="approval"&&<button className="approvebtn" onClick={approve}>Approve Pending Retest</button>}</div></div>
 {msg&&<div className="managerstatus">{msg}</div>}</section>
}