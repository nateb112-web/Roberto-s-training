"use client";
import {useEffect,useState} from "react";

type Attempt={number:number;score:number;passed:boolean;date:string;answers?:number[]};
const questions=[{q:"When should you perform your first check-back after food is delivered?",a:["Immediately","Within about 2 minutes / 2 bites","After 10 minutes","Only if called over"],correct:1},{q:"What is the primary goal of the Steps of Service?",a:["Move tables as fast as possible","Create a consistent guest experience","Avoid talking to guests","Sell only specials"],correct:1},{q:"If a guest has an issue, what should you do first?",a:["Ignore it","Argue your point","Listen and acknowledge the concern","Immediately bring the check"],correct:2}];
type ExamState={attempts:Attempt[];locked:boolean;retestState:"none"|"released"|"approval"};
export default function RetestControls(){
 const [state,setState]=useState<ExamState>({attempts:[{number:1,score:67,passed:false,date:"Today"}],locked:true,retestState:"none"});
 const [msg,setMsg]=useState("");
 const [request,setRequest]=useState<{employee:string;quiz:string;score:number;attempt:number;date:string}|null>(null);
 const [openAttempt,setOpenAttempt]=useState<number|null>(null);
 useEffect(()=>{try{const raw=localStorage.getItem("robertos-final-exam");if(raw)setState(JSON.parse(raw));const req=localStorage.getItem("robertos-retest-request");if(req)setRequest(JSON.parse(req))}catch{}},[]);
 function setRetest(mode:"released"|"approval"){
   const next={...state,locked:true,retestState:mode}; setState(next); localStorage.setItem("robertos-final-exam",JSON.stringify(next));
   setMsg(mode==="released"?"Retest released — employee can begin now.":"Retest assigned — manager approval required before it begins.");
 }
 function approve(){
   const next={...state,locked:true,retestState:"released" as const}; setState(next); localStorage.setItem("robertos-final-exam",JSON.stringify(next)); setMsg("Manager approval granted — retest is now available.");
 }
 const last=state.attempts.at(-1);
 return <section className="card retestpanel"><div className="section-title"><h2>Quiz Retests</h2><span className="muted">Manager controls</span></div>
 <div className="retestrow"><div><strong>{request?request.employee:"Employee"} — {request?request.quiz:"Final Server Exam"}</strong><div className="muted">{request?"Retest requested • Previous score "+request.score+"% • Attempt "+request.attempt:last?(last.passed?"Passed":"Failed")+" Attempt "+last.number+" • "+last.score+"%":"No attempts yet"}</div>{request&&<small>Requested {request.date}</small>}{!request&&state.attempts.length>0&&<small>{state.attempts.length} total attempt{state.attempts.length===1?"":"s"} recorded</small>}</div>
 <div className="retestactions"><button className="outline" onClick={()=>setRetest("released")}>Retest — No Approval</button><button onClick={()=>setRetest("approval")}>Retest — Manager Approval</button>{state.retestState==="approval"&&<button className="approvebtn" onClick={approve}>Approve Pending Retest</button>}</div></div>
 {state.attempts.length>0&&<div className="managerattempts"><h3>Attempt History</h3>{state.attempts.map(a=><div key={a.number}><button className="managerattemptrow" onClick={()=>setOpenAttempt(openAttempt===a.number?null:a.number)}><span>Attempt {a.number}</span><span>{a.date}</span><strong>{a.score}%</strong><span className={a.passed?"passpill":"failpill"}>{a.passed?"Passed":"Failed"}</span><b>{openAttempt===a.number?"Hide":"View Test"}</b></button>{openAttempt===a.number&&<div className="managerreview">{a.answers?<>{questions.map((q,i)=>{const selected=a.answers?.[i]??-1;return <div className="reviewrow" key={q.q}><b>{i+1}. {q.q}</b><p>Employee answer: <strong>{selected>=0?q.a[selected]:"Not recorded"}</strong></p><p className={selected===q.correct?"correctanswer":"wronganswer"}>{selected===q.correct?"✓ Correct":"✕ Incorrect — Correct answer: "+q.a[q.correct]}</p></div>})}</>:<p className="muted">Answer-level details were not stored for this older attempt. New attempts will include the full test review.</p>}</div>}</div>)}</div>}
 {msg&&<div className="managerstatus">{msg}</div>}</section>
}