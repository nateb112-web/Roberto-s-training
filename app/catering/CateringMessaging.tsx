"use client";
import {useCallback,useEffect,useState} from "react";
import EventChat from "../components/EventChat";
type Booking={id:string;event_name:string;event_date:string;customer_name:string;status:string};
type Message={id:string;sender:string;body:string;created_at:string};
const BASE="https://xtuhannfnvsvvahrzyxj.supabase.co/rest/v1/catering_events";
const KEY="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
const token=()=>{try{return JSON.parse(sessionStorage.getItem("robertos_auth")||"{}").access_token||""}catch{return ""}};
export default function CateringMessaging(){
 const [events,setEvents]=useState<Booking[]>([]),[threads,setThreads]=useState<Record<string,Message[]>>({}),[selected,setSelected]=useState<string|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{setLoading(true);try{
  const t=token();if(!t)throw Error("Please sign in again.");
  const r=await fetch(BASE+"?select=id,event_name,event_date,customer_name,status&order=event_date.desc&limit=200",{headers:{apikey:KEY,Authorization:"Bearer "+t},cache:"no-store"});
  if(!r.ok)throw Error("Unable to load bookings");
  const bookings:Booking[]=await r.json();
  const results=await Promise.all(bookings.map(async e=>{try{const m=await fetch("/api/customer/messages?eventId="+encodeURIComponent(e.id),{headers:{Authorization:"Bearer "+t},cache:"no-store"});return [e.id,m.ok?((await m.json()).messages||[]):[]] as [string,Message[]]}catch{return [e.id,[]] as [string,Message[]]}}));
  setEvents(bookings);setThreads(Object.fromEntries(results));setError("");
 }catch(e){setError(String(e))}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 const conversations=events.map(event=>({event,messages:threads[event.id]||[]})).filter(x=>x.messages.length).sort((a,b)=>new Date(b.messages[b.messages.length-1].created_at).getTime()-new Date(a.messages[a.messages.length-1].created_at).getTime());
 const current=conversations.find(x=>x.event.id===selected);
 return <section style={{background:"#131f2b",border:"1px solid #2b3a49",borderRadius:13,padding:20}}>
 <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><h2 style={{margin:"0 0 7px"}}>Customer Messaging</h2><p style={{color:"#a8b8c7",margin:0}}>All customer conversations, organized by booking. Select an event to read and reply.</p></div><button onClick={()=>void load()} disabled={loading} style={{padding:"10px 16px",background:"#29445b",color:"white",border:"1px solid #48627b",borderRadius:8,cursor:"pointer"}}>Refresh</button></div>
 {error&&<p role="alert" style={{color:"#ffb7a6"}}>{error}</p>}
 {loading?<p style={{marginTop:22}}>Loading conversations…</p>:conversations.length===0?<p style={{marginTop:22,color:"#b8c9d8"}}>No customer messages yet. Conversations will appear here when messages are sent.</p>:
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,330px),1fr))",gap:18,marginTop:22,alignItems:"start"}}>
 <div style={{display:"grid",gap:9}}>{conversations.map(({event,messages})=>{const last=messages[messages.length-1];return <button key={event.id} onClick={()=>setSelected(event.id)} style={{textAlign:"left",padding:16,borderRadius:11,border:"1px solid "+(selected===event.id?"#c79c60":"#385064"),background:selected===event.id?"#283344":"#182b3b",color:"#f4f5f7",cursor:"pointer",width:"100%"}}><div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}><strong style={{color:"#e7b77a"}}>{event.event_name}</strong><span style={{fontSize:12,color:"#aabdd0"}}>{event.event_date}</span></div><div style={{fontSize:13,marginTop:5}}>{event.customer_name}</div><div style={{fontSize:13,color:"#c5d1dd",marginTop:9,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{last.sender==="customer"?"Customer: ":"Roberto’s: "}{last.body}</div><div style={{fontSize:11,color:"#9eb1c4",marginTop:7}}>{messages.length} message{messages.length===1?"":"s"} · {new Date(last.created_at).toLocaleString()}</div></button>})}</div>
 <div style={{border:"1px solid #385064",background:"#172b3b",padding:18,borderRadius:12}}>{current?<><h3 style={{margin:"0 0 4px",color:"#e7b77a"}}>{current.event.event_name}</h3><div style={{fontSize:13,color:"#b8c9d8"}}>{current.event.customer_name} · {current.event.event_date}</div><EventChat eventId={current.event.id} getToken={token} staff/></>:<p style={{color:"#b8c9d8"}}>Choose a booking to open its conversation.</p>}</div></div>}
 </section>
}