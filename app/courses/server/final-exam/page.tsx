"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

type Attempt={number:number;score:number;passed:boolean;date:string};
const questions=[
 {q:"When should you perform your first check-back after food is delivered?",a:["Immediately","Within about 2 minutes / 2 bites","After 10 minutes","Only if called over"],correct:1},
 {q:"What is the primary goal of the Steps of Service?",a:["Move tables as fast as possible","Create a consistent guest experience","Avoid talking to guests","Sell only specials"],correct:1},
 {q:"If a guest has an issue, what should you do first?",a:["Ignore it","Argue your point","Listen and acknowledge the concern","Immediately bring the check"],correct:2}
];

export default function FinalExam(){
 const [answers,setAnswers]=useState<number[]>(questions.map(()=>-1));
 const [attempts,setAttempts]=useState<Attempt[]>([]);
 const [locked,setLocked]=useState(false);
 const [submitted,setSubmitted]=useState(false);
 const [lastScore,setLastScore]=useState<number|null>(null);
 const [retestState,setRetestState]=useState<"none"|"released"|"approval">("none");
 useEffect(()=>{try{const raw=localStorage.getItem("robertos-final-exam");if(raw){const d=JSON.parse(raw);setAttempts(d.attempts||[]);setLocked(d.locked||false);setRetestState(d.retestState||"none")}}catch{}},[]);
 function persist(a:Attempt[],l:boolean,r:typeof retestState){localStorage.setItem("robertos-final-exam",JSON.stringify({attempts:a,locked:l,retestState:r}))}
 function submit(){
   if(answers.some(a=>a<0))return;
   const correct=questions.filter((q,i)=>answers[i]===q.correct).length;
   const score=Math.round(correct/questions.length*100), passed=score>=80;
   const next=[...attempts,{number:attempts.length+1,score,passed,date:new Date().toLocaleDateString()}];
   setAttempts(next);setLastScore(score);setSubmitted(true);
   const shouldLock=!passed; setLocked(shouldLock); setRetestState("none"); persist(next,shouldLock,"none");
 }
 function beginRetest(){
   if(retestState==="approval")return;
   setLocked(false);setSubmitted(false);setLastScore(null);setAnswers(questions.map(()=>-1));setRetestState("none");persist(attempts,false,"none");
 }
 const passed=lastScore!==null&&lastScore>=80;
 return <div className="learner"><header className="editornav"><div className="brand"><span>ROBERTO'S</span> TRAINING</div><nav><Link href="/">Dashboard</Link><Link href="/courses/server">My Training</Link></nav><div className="navright">East Windsor <b className="avatar">NB</b> Nathan⌄</div></header>
 <main className="examwrap"><div className="learncrumb"><Link href="/courses/server">‹ Server Training</Link><span>Final Exam</span></div>
 <div className="examhead"><div><span className="pill">SERVER TRAINING</span><h1>Final Server Exam</h1><p>Passing score: 80%. Failed attempts require a manager-released retest.</p></div><div className="attemptbadge">ATTEMPT <b>{attempts.length+(locked?0:1)}</b></div></div>
 {locked?<section className="card lockcard"><div className="lockicon">🔒</div><h2>Quiz Locked</h2><p>Your last attempt did not meet the required passing score. Another attempt must be released by a manager.</p><div className="lastresult"><span>Last Score</span><strong>{attempts.at(-1)?.score}%</strong><span>Attempt {attempts.at(-1)?.number}</span></div>{retestState==="approval"?<div className="pendingapproval">Manager approval is required before this retest can begin.</div>:retestState==="released"?<button onClick={beginRetest}>Begin Retest</button>:<div className="pendingapproval">Waiting for a manager to issue a retest.</div>}</section>:
 <section className="examgrid"><div>{questions.map((q,qi)=><section className="card examquestion" key={q.q}><div className="qnumber">QUESTION {qi+1} OF {questions.length}</div><h2>{q.q}</h2><div className="answerlist">{q.a.map((a,ai)=><button key={a} className={answers[qi]===ai?"selected":""} onClick={()=>setAnswers(answers.map((v,i)=>i===qi?ai:v))}><span>{String.fromCharCode(65+ai)}</span>{a}</button>)}</div></section>)}<button className="submitexam" disabled={answers.some(a=>a<0)} onClick={submit}>Submit Final Exam</button></div>
 <aside className="card examaside"><div className="eyebrow">EXAM STATUS</div><h3>{questions.filter((_,i)=>answers[i]>=0).length} / {questions.length}</h3><p className="muted">questions answered</p><div className="progress"><i style={{width:(questions.filter((_,i)=>answers[i]>=0).length/questions.length*100)+"%"}}/></div><hr/><b>Passing Score</b><p>80%</p><b>Retake Policy</b><p>Manager-released retest only</p></aside></section>}
 {submitted&&!locked&&<div className={"resultmodal "+(passed?"pass":"fail")}><div><h2>{passed?"✓ Passed":"Not Passed"}</h2><strong>{lastScore}%</strong><p>{passed?"You successfully completed the Final Server Exam.":"This attempt has been recorded and the exam is now locked."}</p><Link className="btn linkbtn" href="/courses/server">Return to Course</Link></div></div>}
 {attempts.length>0&&<section className="card attempthistory"><div className="section-title"><h2>Attempt History</h2><span className="muted">{attempts.length} total attempt{attempts.length===1?"":"s"}</span></div>{attempts.map(a=><div className="attemptrow" key={a.number}><b>Attempt {a.number}</b><span>{a.date}</span><strong>{a.score}%</strong><span className={a.passed?"passpill":"failpill"}>{a.passed?"Passed":"Failed"}</span></div>)}</section>}
 </main></div>
}