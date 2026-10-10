"use client";
import {useState} from "react";
import Link from "next/link";
const endpoint="https://xtuhannfnvsvvahrzyxj.supabase.co/auth/v1/";
const apiKey="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export default function Login(){
 const [forgot,setForgot]=useState(false),[register,setRegister]=useState(false),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[message,setMessage]=useState(""),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage("");
  try{
   const response=await fetch(endpoint+(forgot?"recover":register?"signup":"token?grant_type=password"),{method:"POST",headers:{"Content-Type":"application/json",apikey:apiKey},body:JSON.stringify(forgot?{email}:{email,password})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.msg||result.error_description||result.message||"Sign-in failed");
   if(forgot)setMessage("If this email has an account, a password setup link has been sent. Please check your inbox and spam folder.");else if(register)setMessage("Check your email for a verification link. Then return here to sign in.");
   else {if(!result.access_token)throw new Error("Verify your email before signing in.");sessionStorage.setItem("robertos_auth",JSON.stringify(result));window.location.assign("/account");}
  }catch(error){setMessage(error instanceof Error?error.message:"Something went wrong")}finally{setBusy(false)}
 }
 return <main className="wrap" style={{maxWidth:520,paddingTop:60}}><div className="card" style={{padding:32}}><Link href="/">← Roberto's Training</Link><h1>{forgot?"Reset Password":register?"Create Account":"Sign In"}</h1><p>{forgot?"Enter your email and we will send a secure password reset link.":"Each employee has their own account."}</p><form onSubmit={submit} style={{display:"grid",gap:14}}><label>Email<br/><input style={{width:"100%",padding:12}} type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>{!forgot&&<label>Password<br/><input style={{width:"100%",padding:12}} type="password" minLength={6} autoComplete={register?"new-password":"current-password"} required value={password} onChange={e=>setPassword(e.target.value)}/></label>}<button disabled={busy} type="submit">{busy?"Please wait…":forgot?"Send Reset Link":register?"Create Account":"Sign In"}</button></form>{message&&<p role="status">{message}</p>}<div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:20}}><button type="button" className="outline" onClick={()=>{setForgot(false);setRegister(false);setMessage("")}}>Sign In</button>{!forgot&&<button type="button" className="outline" onClick={()=>{setRegister(!register);setMessage("")}}>{register?"Back to Sign In":"Create an account"}</button>}{!forgot&&<button type="button" className="outline" onClick={()=>{setForgot(true);setRegister(false);setMessage("")}}>Forgot Password?</button>}</div></div></main>;
}