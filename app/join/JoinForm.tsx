"use client";
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co",key="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
const positions=[["server","Server"],["bartender","Bartender"],["kitchen","Kitchen"],["host","Host"],["busser","Busser"]];
export default function JoinForm(){
 const params=useSearchParams(),invite=params.get("invite")||"";
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[selected,setSelected]=useState<string[]>([]),[valid,setValid]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
 useEffect(()=>{if(!invite){setValid(false);return}fetch("/api/staff-group-invite/verify?invite="+encodeURIComponent(invite)).then(r=>r.json()).then(d=>setValid(d.valid===true)).catch(()=>setValid(false))},[invite]);
 async function submit(e:React.FormEvent){e.preventDefault();if(!valid||!selected.length)return;setBusy(true);setMessage("");try{
 const response=await fetch("/api/staff-group-invite/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({invite,name,email,password,positions:selected})});
 const data=await response.json();if(!response.ok)throw Error(data.error||"Registration failed");setMessage("Account created. Check your email for verification, then sign in.");
 }catch(e){setMessage(e instanceof Error?e.message:"Unable to register")}finally{setBusy(false)}}
 return <main className="wrap" style={{maxWidth:560,paddingTop:45}}><div className="card" style={{padding:28}}><h1>Join Roberto's Staff</h1>{valid===null?<p>Checking invitation…</p>:!valid?<p>This invitation is invalid or expired. Ask your manager for a new link.</p>:<form onSubmit={submit} style={{display:"grid",gap:15}}><label>Full name<input required value={name} onChange={e=>setName(e.target.value)} style={{width:"100%"}}/></label><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%"}}/></label><fieldset><legend>Position (select all that apply)</legend>{positions.map(([value,label])=><label key={value} style={{display:"block",margin:8}}><input type="checkbox" checked={selected.includes(value)} onChange={e=>setSelected(p=>e.target.checked?[...p,value]:p.filter(x=>x!==value))}/>{label}</label>)}</fieldset><label>Create password<input type="password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} style={{width:"100%"}}/></label><button disabled={busy||!selected.length}>{busy?"Creating account…":"Create Staff Account"}</button></form>}{message&&<p role="status">{message}</p>}</div></main>
}