"use client";
import Link from "next/link";
import {useState} from "react";
const checks=["Greet every table promptly","Introduce yourself and Roberto's","Present menus and answer initial questions","Take drink orders immediately","Return with drinks and take food orders","Check back within 2 minutes after food delivery","Anticipate needs and keep the table comfortable"];
export default function Lesson(){
 const [done,setDone]=useState<boolean[]>(checks.map(()=>false));
 const [answer,setAnswer]=useState("");
 const [checked,setChecked]=useState(false);
 const [complete,setComplete]=useState(false);
 const correct=answer==="B";
 const all=done.every(Boolean);
 return <div className="learner"><header className="editornav"><div className="brand"><span>ROBERTO'S</span> TRAINING</div><nav><Link href="/">Dashboard</Link><Link href="/courses/server">My Training</Link></nav><div className="navright">East Windsor <b className="avatar">NB</b> Nathan⌄</div></header>
 <div className="learnprogress"><i style={{width:complete?"100%":"50%"}}/></div>
 <main className="learnpage"><div className="learncrumb"><Link href="/courses/server">‹ Server Training</Link><span>Lesson 6 of 12</span></div>
 <section className="lessonmast"><div><span className="pill">SERVER TRAINING</span><h1>Steps of Service</h1><p>Learn the step-by-step process for providing excellent service at Roberto’s, from greeting the guest to closing the check.</p><div className="lessonmeta">◷ 10 minutes　•　▤ Required lesson</div></div><div className="lessonnumber">06</div></section>
 <div className="learnlayout"><article>
 <section className="learncard"><span className="sectionlabel">INTRODUCTION</span><h2>Deliver a Consistent Guest Experience</h2><p>Great service should feel natural to the guest, but it comes from following a consistent sequence. These steps help make sure every table is welcomed, cared for, and leaves with a positive impression of Roberto’s.</p><div className="tipbox"><b>Remember</b><p>These are standards, not a script. Use your personality while making sure every important service step happens.</p></div></section>
 <section className="learncard"><span className="sectionlabel">WATCH</span><h2>Service Video Example</h2><p>Watch the example below before continuing.</p><div className="trainingvideo"><div className="videologo">ROBERTO'S<small>AMERICAN TAVERN</small></div><button>▶</button><span>Training video placeholder</span></div></section>
 <section className="learncard"><span className="sectionlabel green">CHECKLIST</span><h2>Key Steps of Service</h2><p>Check each item as you review the expected service sequence.</p><div className="learnerchecks">{checks.map((x,i)=><label className={done[i]?"checked":""} key={x}><input type="checkbox" checked={done[i]} onChange={()=>setDone(done.map((v,j)=>j===i?!v:v))}/><span>{i+1}</span><b>{x}</b></label>)}</div></section>
 <section className="learncard"><span className="sectionlabel amber">KNOWLEDGE CHECK</span><h2>Quick Check</h2><p className="question">When should you check back after the guest receives their food?</p><div className="answerlist">{[["A","Immediately after placing the plates down"],["B","Within about two minutes / two bites"],["C","Only if the guest asks for you"],["D","When you are ready to bring the check"]].map(a=><button key={a[0]} className={answer===a[0]?"selected":""} onClick={()=>{setAnswer(a[0]);setChecked(false)}}><span>{a[0]}</span>{a[1]}</button>)}</div><button className="checkanswer" disabled={!answer} onClick={()=>setChecked(true)}>Check Answer</button>{checked&&<div className={correct?"feedback correct":"feedback wrong"}>{correct?"✓ Correct — check back within about two minutes or two bites.":"Not quite. Review the service timing and try again."}</div>}</section>
 <div className="lessonfinish"><Link className="outline linkbtn" href="/courses/server">Save & Exit</Link><button disabled={!all||!correct||!checked} onClick={()=>setComplete(true)}>{complete?"✓ Lesson Complete":"Complete Lesson →"}</button></div>
 </article>
 <aside><div className="card lessonnav"><div className="eyebrow">LESSON PROGRESS</div><h3>{complete?"Complete":"In Progress"}</h3><div className="progress"><i style={{width:complete?"100%":all&&correct?"90%":"55%"}}/></div><p className="muted">{complete?"Great work. This lesson is complete.":"Complete the checklist and knowledge check to finish."}</p><hr/><b>Up Next</b><p>Alcohol Service</p><small>Lesson 7 of 12</small></div></aside></div></main></div>
}