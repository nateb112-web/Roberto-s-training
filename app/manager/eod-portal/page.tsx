"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
export default function EODPortal(){
 const [role,setRole]=useState("manager");
 useEffect(()=>{(async()=>{try{const a=JSON.parse(sessionStorage.getItem("robertos_auth")||"null");if(!a?.access_token)return;const headers={apikey:"sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC",Authorization:"Bearer "+a.access_token};const u=await fetch("https://xtuhannfnvsvvahrzyxj.supabase.co/auth/v1/user",{headers});if(!u.ok)return;const id=(await u.json()).id;const p=await fetch("https://xtuhannfnvsvvahrzyxj.supabase.co/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(id)+"&select=access_role",{headers});if(p.ok)setRole((await p.json())[0]?.access_role||"manager")}catch{}})()},[]);
 const admin=role==="admin";
 const options=[{name:"Daily EOD",desc:"Prepare and submit cashouts, takeout and tip-outs",href:"/manager/eod",icon:"▦"},...(admin?[{name:"EOD Finals",desc:"Approve days and review weekly totals",href:"/manager/eod-finals",icon:"✓"},{name:"EOD Employee List",desc:"Manage active EOD staff and account links",href:"/manager/eod-employees",icon:"♙"},{name:"EOD Past Reports",desc:"Review approved past weeks and daily records",href:"/manager/eod-reports",icon:"▤"}]:[])];
 return <main className="wrap" style={{maxWidth:1080}}><div className="managerhero"><div><div className="eyebrow">EAST WINDSOR · EOD</div><h1>{admin?"Choose an EOD Area":"End of Day"}</h1><p>{admin?"Select the area you want to work in.":"Access your assigned manager EOD work."}</p></div></div><section className="managerquick">{options.map(o=><Link className="managerquickcard" key={o.href} href={o.href}><span>{o.icon}</span><div><b>{o.name}</b><small>{o.desc}</small></div><strong>→</strong></Link>)}</section></main>
}