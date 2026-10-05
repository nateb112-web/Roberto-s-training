"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

type Lesson={id:number;title:string;type:"Lesson"|"Quiz"|"Manager Sign-Off"};
const starter:Lesson[]=[
{id:1,title:"Welcome & Expectations",type:"Lesson"},
{id:2,title:"Menu Knowledge",type:"Lesson"},
{id:3,title:"Steps of Service",type:"Lesson"},
{id:4,title:"POS Training",type:"Lesson"},
{id:5,title:"Alcohol Service",type:"Lesson"},
{id:6,title:"Side Work",type:"Lesson"},
{id:7,title:"Guest Recovery",type:"Lesson"},
{id:8,title:"Final Exam",type:"Quiz"}];

export default function Builder(){
 const [name,setName]=useState("New Server Training");
 const [track,setTrack]=useState("Server");
 const [score,setScore]=useState("80%");
 const [description,setDescription]=useState("Everything a new server needs to complete before certification.");
 const [lessons,setLessons]=useState<Lesson[]>(starter);
 const [newTitle,setNewTitle]=useState("");
 const [newType,setNewType]=useState<Lesson["type"]>("Lesson");
 const [saved,setSaved]=useState("");
 useEffect(()=>{const raw=localStorage.getItem("robertos-course-draft");if(raw){try{const d=JSON.parse(raw);setName(d.name||name);setTrack(d.track||track);setScore(d.score||score);setDescription(d.description||description);setLessons(d.lessons||starter)}catch{}}},[]);
 function save(status="Draft saved"){localStorage.setItem("robertos-course-draft",JSON.stringify({name,track,score,description,lessons}));setSaved(status);setTimeout(()=>setSaved(""),2500)}
 function add(){if(!newTitle.trim())return;setLessons([...lessons,{id:Date.now(),title:newTitle.trim(),type:newType}]);setNewTitle("")}
 function remove(id:number){setLessons(lessons.filter(l=>l.id!==id))}
 function move(index:number,dir:number){const to=index+dir;if(to<0||to>=lessons.length)return;const copy=[...lessons];[copy[index],copy[to]]=[copy[to],copy[index]];setLessons(copy)}
 return <><header className="top"><div className="brand"><span>ROBERTO'S</span> TRAINING</div><Link className="toplink" href="/manager">Manager Dashboard</Link></header>
 <main className="wrap narrow"><div className="muted">COURSE BUILDER</div><h1>Create a Training Course</h1><p className="muted">Build and organize training from this screen. Drafts currently save on this device while we connect employee accounts and cloud storage.</p>
 <section className="card form">
 <label>Course name<input value={name} onChange={e=>setName(e.target.value)}/></label>
 <div className="formgrid"><label>Training track<select value={track} onChange={e=>setTrack(e.target.value)}><option>New Hire</option><option>Server</option><option>Bartender</option><option>Host / Support</option><option>Manager</option><option>LTO / Seasonal</option></select></label><label>Passing score<select value={score} onChange={e=>setScore(e.target.value)}><option>70%</option><option>80%</option><option>90%</option><option>100%</option></select></label></div>
 <label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)}/></label>
 <div className="builder"><div className="section-title"><h2>Course Content</h2><span className="muted">{lessons.length} items</span></div>
 {lessons.map((l,i)=><div className="lesson editable" key={l.id}><span>{i+1}</span><div><input className="inlineinput" value={l.title} onChange={e=>setLessons(lessons.map(x=>x.id===l.id?{...x,title:e.target.value}:x))}/><select className="inlineselect" value={l.type} onChange={e=>setLessons(lessons.map(x=>x.id===l.id?{...x,type:e.target.value as Lesson["type"]}:x))}><option>Lesson</option><option>Quiz</option><option>Manager Sign-Off</option></select></div><div className="rowactions"><button className="mini outline" onClick={()=>move(i,-1)}>↑</button><button className="mini outline" onClick={()=>move(i,1)}>↓</button><button className="mini danger" onClick={()=>remove(l.id)}>×</button></div></div>)}
 <div className="addpanel"><input placeholder="New item title" value={newTitle} onChange={e=>setNewTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")add()}}/><select value={newType} onChange={e=>setNewType(e.target.value as Lesson["type"])}><option>Lesson</option><option>Quiz</option><option>Manager Sign-Off</option></select><button onClick={add}>+ Add</button></div>
 </div><div className="actions">{saved&&<span className="saved">{saved}</span>}<button className="outline" onClick={()=>save()}>Save Draft</button><button onClick={()=>save("Course saved — publishing will activate with accounts")}>Publish Course</button></div>
 </section></main></>
}