"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import Link from "next/link";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co";
const key="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export default function AuthGate({children}:{children:React.ReactNode}){
 const path=usePathname(),[allowed,setAllowed]=useState(false),[error,setError]=useState("");
 useEffect(()=>{let cancelled=false;setAllowed(false);setError("");
 async function check(){
  if(path==="/login"||path==="/set-password"){if(!cancelled)setAllowed(true);return}
  try{
   const raw=sessionStorage.getItem("robertos_auth");
   if(!raw)throw Error("not signed in");
   const token=JSON.parse(raw).access_token;
   if(!token)throw Error("missing token");
   const headers={apikey:key,Authorization:"Bearer "+token};
   const me=await fetch(base+"/auth/v1/user",{headers,cache:"no-store"});
   if(!me.ok)throw Error("expired session");
   const user=await me.json();
   const response=await fetch(base+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role,display_name",{headers,cache:"no-store"});
   if(!response.ok)throw Error("profile lookup failed");
   const profiles=await response.json();
   const profile=profiles[0];
   if(!profile)throw Error("no staff profile");
   if(path.startsWith("/manager")&&!["admin","manager"].includes(profile.access_role)){window.location.replace("/");return}
   if(path==="/"&&["admin","manager"].includes(profile.access_role)){window.location.replace("/manager");return}
   if(!cancelled)setAllowed(true);
  }catch(e){
   if(!cancelled){sessionStorage.removeItem("robertos_auth");window.location.replace("/login?next="+encodeURIComponent(path))}
  }
 }
 check();return()=>{cancelled=true}
 },[path]);
 if(!allowed)return <main className="wrap" style={{paddingTop:60}} role="status">Checking account access… {error&&<Link href="/login">Sign in</Link>}</main>;
 return <>{children}</>
}
