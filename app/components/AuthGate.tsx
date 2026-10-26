"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import Link from "next/link";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co";
const key="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export default function AuthGate({children}:{children:React.ReactNode}){
 const path=usePathname(),[allowed,setAllowed]=useState(false),[role,setRole]=useState("staff"),[error,setError]=useState("");
 useEffect(()=>{let cancelled=false;setAllowed(false);setError("");
 async function check(){
  if(path==="/login"||path==="/set-password"||path==="/join"||path==="/join"){if(!cancelled)setAllowed(true);return}
  try{
   const raw=sessionStorage.getItem("robertos_auth");
   if(!raw)throw Error("not signed in");
   let session=JSON.parse(raw);let token=session.access_token;const refresh=async()=>{if(!session.refresh_token)return false;const response=await fetch(base+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:key,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:session.refresh_token})});if(!response.ok)return false;session=await response.json();token=session.access_token;sessionStorage.setItem("robertos_auth",JSON.stringify(session));return true};if(session.expires_at&&Date.now()/1000>session.expires_at-120)await refresh();
   if(!token)throw Error("missing token");
   let headers={apikey:key,Authorization:"Bearer "+token};
   let me=await fetch(base+"/auth/v1/user",{headers,cache:"no-store"});if(me.status===401&&await refresh()){headers={apikey:key,Authorization:"Bearer "+token};me=await fetch(base+"/auth/v1/user",{headers,cache:"no-store"})}
   if(!me.ok)throw Error("expired session");
   const user=await me.json();
   const response=await fetch(base+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role,display_name",{headers,cache:"no-store"});
   if(!response.ok)throw Error("profile lookup failed");
   const profiles=await response.json();
   const profile=profiles[0];
   if(!profile)throw Error("no staff profile");
   if(path.startsWith("/manager")&&!["admin","manager"].includes(profile.access_role)){window.location.replace("/");return}
   if(path==="/"&&["admin","manager"].includes(profile.access_role)){window.location.replace("/manager");return}
   if(!cancelled){setRole(profile.access_role);setAllowed(true)}
  }catch(e){
   if(!cancelled){sessionStorage.removeItem("robertos_auth");window.location.replace("/login?next="+encodeURIComponent(path))}
  }
 }
 check();return()=>{cancelled=true}
 },[path]);
 if(!allowed)return <main className="wrap" style={{paddingTop:60}} role="status">Checking account access… {error&&<Link href="/login">Sign in</Link>}</main>;
 if(path==="/login"||path==="/set-password")return <>{children}</>;
 const manager=role==="admin"||role==="manager";const home=manager?"/manager":"/";
 return <div className="robertos-shell"><aside className="robertos-sidebar"><div className="robertos-sidebar-brand"><strong>Roberto’s</strong><span>TAVERN</span><small>OF EAST WINDSOR</small></div><nav><Link className={path===home?"selected":""} href={home}>⌂ &nbsp; Dashboard</Link><Link className={path==="/my-earnings"?"selected":""} href="/my-earnings">＄ &nbsp; My Earnings</Link>{!manager&&<><Link className={path.startsWith("/courses")||path.startsWith("/training")?"selected":""} href="/courses/server">▤ &nbsp; Training</Link><Link className={path.startsWith("/resources")?"selected":""} href="/resources">▥ &nbsp; Resources</Link><Link className={path.startsWith("/study")?"selected":""} href="/study">▣ &nbsp; Study Materials</Link></>}{manager&&<><Link className={path.startsWith("/manager/line-check")?"selected":""} href="/manager/line-check">▣ &nbsp; Line Checks</Link><Link className={path.startsWith("/manager/eod")?"selected":""} href="/manager/eod-portal">▦ &nbsp; EOD</Link><Link href="/manager/study">▤ &nbsp; Training</Link><Link href="/manager/resources">▤ &nbsp; Resources</Link><Link href="/manager/employees">♙ &nbsp; Employees</Link></>}<Link className={path==="/account"?"selected":""} href="/account">⚙ &nbsp; Account Settings</Link></nav></aside><div className="robertos-shell-content">{children}</div></div>
}
