"use client";
import Link from "next/link";
import EmployeeNav from "../../../components/EmployeeNav";
import {useEffect,useState} from "react";

type Attempt={number:number;score:number;passed:boolean;date:string;answers?:number[]};
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
 const [retestState,setRetestState]=useState<"none"|"requested"|"released"|"approval">("none");
 const [reviewing,setReviewing]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem("robertos-final-exam");if(raw){const d=JSON.parse(raw);setAttempts(d.attempts||[]);setLocked(d.locked||false);setRetestState(d.retestState||"none")}}catch{}},[]);
 function persist(a:Attempt[],l:boolean,r:typeof retestState){localStorage.setItem("robertos-final-exam",JSON.stringify({attempts:a,locked:l,retestState:r}))}
 function submit(){
   if(answers.some(a=>a<0))return;
   const correct=questions.filter((q,i)=>answers[i]===q.correct).length;
   const score=Math.round(correct/questions.length*100), passed=score>=80;
   const next=[...attempts,{number:attempts.length+1,score,passed,date:new Date().toLocaleDateString(),answers:[...answers]}];
   setAttempts(next);setLastScore(score);setSubmitted(true);
   const shouldLock=!passed; setLocked(shouldLock); setRetestState("none"); persist(next,shouldLock,"none");
 }
 function requestRetest(){const last=attempts.at(-1);if(!last)return;setRetestState("requested");localStorage.setItem("robertos-retest-request",JSON.stringify({employee:"Nathan Barry",quiz:"Final Server Exam",score:last.score,attempt:last.number,date:new Date().toLocaleDateString(),status:"requested"}));persist(attempts,true,"requested")}
 function beginRetest(){
   if(retestState==="approval")return;
   setLocked(false);setSubmitted(false);setLastScore(null);setAnswers(questions.map(()=>-1));setRetestState("none");persist(attempts,false,"none");
 }
 const passed=lastScore!==null&&lastScore>=80;
 return <div className="learner"><EmployeeNav/>
 <main className="examwrap"><div className="learncrumb"><Link href="/courses/server">‹ Server Training</Link><span>Final Exam</span></div>
 <div className="examhead"><div><span className="pill">SERVER TRAINING</span><h1>Final Server Exam</h1><p>Passing score: 80%. Failed attempts require a manager-released retest.</p></div><div className="attemptbadge">ATTEMPT <b>{attempts.length+(locked?0:1)}</b></div></div>
 {locked?<section className="resultcard failedresult"><div className="resultmark">✕</div><div><div className="eyebrow">FINAL SERVER EXAM</div><h2>Not Passed</h2><div className="bigscore">{attempts.at(-1)?.score}%</div><p>A passing score of 80% is required. Attempt {attempts.at(-1)?.number} has been recorded.</p></div><div className="resultactions">{retestState==="released"?<button onClick={beginRetest}>Begin Retest</button>:retestState==="requested"?<button disabled>Retest Requested</button>:retestState==="approval"?<button disabled>Waiting for Manager Approval</button>:<button onClick={requestRetest}>Request Retest</button>}<Link className="btn linkbtn outline" href="/courses/server">Return to Course</Link></div></section>:
 <section className="examgrid"><div>{questions.map((q,qi)=><section className="card examquestion" key={q.q}><div className="qnumber">QUESTION {qi+1} OF {questions.length}</div><h2>{q.q}</h2><div className="answerlist">{q.a.map((a,ai)=><button key={a} className={answers[qi]===ai?"selected":""} onClick={()=>setAnswers(answers.map((v,i)=>i===qi?ai:v))}><span>{String.fromCharCode(65+ai)}</span>{a}</button>)}</div></section>)}<button className="submitexam" disabled={answers.some(a=>a<0)} onClick={submit}>Submit Final Exam</button></div>
 <aside className="card examaside"><div className="eyebrow">EXAM STATUS</div><h3>{questions.filter((_,i)=>answers[i]>=0).length} / {questions.length}</h3><p className="muted">questions answered</p><div className="progress"><i style={{width:(questions.filter((_,i)=>answers[i]>=0).length/questions.length*100)+"%"}}/></div><hr/><b>Passing Score</b><p>80%</p><b>Retake Policy</b><p>Manager-released retest only</p></aside></section>}
 {submitted&&!locked&&passed&&<section className="resultcard passedresult"><div className="resultmark">✓</div><div><div className="eyebrow">FINAL SERVER EXAM</div><h2>Passed</h2><div className="bigscore">{lastScore}%</div><p>You successfully completed the Final Server Exam.</p></div><div className="resultactions"><button onClick={()=>setReviewing(!reviewing)}>{reviewing?"Hide Review":"Review Test"}</button><Link className="btn linkbtn outline" href="/courses/server">Return to Course</Link></div></section>}{reviewing&&<section className="card reviewexam"><div className="section-title"><h2>Test Review</h2><span className="passpill">Passed</span></div>{questions.map((q,i)=><div className="reviewrow" key={q.q}><b>{i+1}. {q.q}</b><p>Your answer: <strong>{q.a[answers[i]]}</strong></p><p className={answers[i]===q.correct?"correctanswer":"wronganswer"}>{answers[i]===q.correct?"✓ Correct":"✕ Incorrect — Correct answer: "+q.a[q.correct]}</p></div>)}</section>}
 {attempts.length>0&&<section className="card attempthistory"><div className="section-title"><h2>Attempt History</h2><span className="muted">{attempts.length} total attempt{attempts.length===1?"":"s"}</span></div>{attempts.map(a=><div className="attemptrow" key={a.number}><b>Attempt {a.number}</b><span>{a.date}</span><strong>{a.score}%</strong><span className={a.passed?"passpill":"failpill"}>{a.passed?"Passed":"Failed"}</span></div>)}</section>}
 </main></div>
}