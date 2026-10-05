"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

type BlockType="Text"|"Video"|"Image"|"Document"|"Checklist"|"Question"|"Manager Sign-Off";
type Block={id:number;type:BlockType;title:string;content:string};

const defaults:Block[]=[
{id:1,type:"Text",title:"Lesson Introduction",content:"Explain what the employee will learn and why it matters."},
{id:2,type:"Checklist",title:"Learning Objectives",content:"Greet every table promptly\nIntroduce yourself and Roberto's\nGuide the guest through the menu\nPerform a two-bite/two-minute check-back"},
{id:3,type:"Question",title:"Knowledge Check",content:"When should you perform your first check-back after food is delivered?"}
];

export default function LessonEditor(){
 const [title,setTitle]=useState("Steps of Service");
 const [blocks,setBlocks]=useState<Block[]>(defaults);
 const [saved,setSaved]=useState("");
 useEffect(()=>{const raw=localStorage.getItem("robertos-lesson-draft");if(raw){try{const d=JSON.parse(raw);setTitle(d.title||title);setBlocks(d.blocks||defaults)}catch{}}},[]);
 function add(type:BlockType){const labels:Record<BlockType,string>={Text:"Text Section",Video:"Training Video",Image:"Image",Document:"Document / PDF",Checklist:"Checklist",Question:"Knowledge Check","Manager Sign-Off":"Manager Sign-Off"};setBlocks([...blocks,{id:Date.now(),type,title:labels[type],content:""}])}
 function update(id:number,key:"title"|"content",value:string){setBlocks(blocks.map(b=>b.id===id?{...b,[key]:value}:b))}
 function move(i:number,d:number){const n=i+d;if(n<0||n>=blocks.length)return;const copy=[...blocks];[copy[i],copy[n]]=[copy[n],copy[i]];setBlocks(copy)}
 function save(){localStorage.setItem("robertos-lesson-draft",JSON.stringify({title,blocks}));setSaved("Lesson draft saved");setTimeout(()=>setSaved(""),2200)}
 return <><header className="top"><div className="brand"><span>ROBERTO'S</span> TRAINING</div><Link className="toplink" href="/manager/courses/new">Back to Course</Link></header>
 <main className="wrap editorwrap"><div className="muted">LESSON EDITOR</div><div className="editorhead"><div><input className="titleinput" value={title} onChange={e=>setTitle(e.target.value)}/><p className="muted">Build this lesson by adding content blocks below.</p></div><div className="actions">{saved&&<span className="saved">{saved}</span>}<button className="outline" onClick={save}>Save Draft</button><button onClick={save}>Save Lesson</button></div></div>
 <div className="editorgrid"><section><div className="blocktoolbar"><strong>Add content</strong><div>{(["Text","Video","Image","Document","Checklist","Question","Manager Sign-Off"] as BlockType[]).map(t=><button key={t} className="outline" onClick={()=>add(t)}>+ {t}</button>)}</div></div>
 {blocks.map((b,i)=><article className="card contentblock" key={b.id}><div className="blocktop"><span className="blocktype">{b.type}</span><div className="rowactions"><button className="mini outline" onClick={()=>move(i,-1)}>↑</button><button className="mini outline" onClick={()=>move(i,1)}>↓</button><button className="mini danger" onClick={()=>setBlocks(blocks.filter(x=>x.id!==b.id))}>×</button></div></div><input className="blocktitle" value={b.title} onChange={e=>update(b.id,"title",e.target.value)}/>
 {b.type==="Text"&&<textarea rows={5} value={b.content} onChange={e=>update(b.id,"content",e.target.value)} placeholder="Enter training content..."/>}
 {b.type==="Video"&&<><input value={b.content} onChange={e=>update(b.id,"content",e.target.value)} placeholder="Paste YouTube, Vimeo, or training video URL"/><div className="placeholder">Video preview will appear here</div></>}
 {b.type==="Image"&&<><input value={b.content} onChange={e=>update(b.id,"content",e.target.value)} placeholder="Image URL or file will be added here"/><div className="placeholder">Image upload area</div></>}
 {b.type==="Document"&&<><input value={b.content} onChange={e=>update(b.id,"content",e.target.value)} placeholder="Document name or URL"/><div className="placeholder">PDF / handbook / training sheet</div></>}
 {b.type==="Checklist"&&<textarea rows={5} value={b.content} onChange={e=>update(b.id,"content",e.target.value)} placeholder={"One checklist item per line"}/>}
 {b.type==="Question"&&<><textarea rows={2} value={b.content} onChange={e=>update(b.id,"content",e.target.value)} placeholder="Question"/><div className="answers"><input placeholder="Answer A"/><input placeholder="Answer B"/><input placeholder="Answer C"/><input placeholder="Answer D"/></div><select><option>Correct answer: A</option><option>Correct answer: B</option><option>Correct answer: C</option><option>Correct answer: D</option></select></>}
 {b.type==="Manager Sign-Off"&&<><textarea rows={3} value={b.content} onChange={e=>update(b.id,"content",e.target.value)} placeholder="What must the employee demonstrate?"/><div className="signpreview">Manager verification required before employee can continue ✓</div></>}
 </article>)}</section>
 <aside className="card preview"><div className="muted">EMPLOYEE PREVIEW</div><h2>{title}</h2><p className="muted">{blocks.length} content blocks</p>{blocks.map(b=><div className="previewblock" key={b.id}><small>{b.type.toUpperCase()}</small><strong>{b.title}</strong>{b.content&&<p>{b.content.split("\n")[0]}</p>}</div>)}</aside></div></main></>
}