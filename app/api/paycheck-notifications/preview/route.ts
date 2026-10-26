import {NextRequest,NextResponse} from "next/server";
const API="https://xtuhannfnvsvvahrzyxj.supabase.co";
const KEY="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export async function POST(req:NextRequest){
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!token)return NextResponse.json({error:"Sign in required"},{status:401});
 const headers={apikey:KEY,Authorization:"Bearer "+token};
 const me=await fetch(API+"/auth/v1/user",{headers,cache:"no-store"});
 if(!me.ok)return NextResponse.json({error:"Invalid session"},{status:401});
 const user=await me.json();
 const role=await fetch(API+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role",{headers,cache:"no-store"});
 if(!role.ok||(await role.json())[0]?.access_role!=="admin")return NextResponse.json({error:"Admin only"},{status:403});
 const {week}=await req.json();
 if(typeof week!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(week))return NextResponse.json({error:"Invalid week"},{status:400});
 const end=new Date(week+"T12:00:00Z");end.setUTCDate(end.getUTCDate()+6);
 const weekEnd=end.toISOString().slice(0,10);
 const [reports,roster]=await Promise.all([fetch(API+"/rest/v1/eod_reports?select=business_date,status,entries&business_date=gte."+week+"&business_date=lte."+weekEnd,{headers,cache:"no-store"}),fetch(API+"/rest/v1/eod_roster?select=display_name,active,linked_user_id&active=eq.true",{headers,cache:"no-store"})]);
 if(!reports.ok||!roster.ok)return NextResponse.json({error:"Could not read payroll preview"},{status:500});
 const employees=await roster.json() as {display_name:string;linked_user_id:string|null}[];
 const days=await reports.json() as {status:string;entries:{name:string;cashOwedEmployee?:number;paidCashTonight?:number}[]}[];
 const result=employees.map(e=>{let cents=0;for(const day of days.filter(d=>d.status==="finalized"))for(const entry of day.entries||[])if(entry.name?.trim().toLowerCase()===e.display_name.trim().toLowerCase())cents+=Math.round(Number(entry.cashOwedEmployee||0)*100)-Math.round(Number(entry.paidCashTonight||0)*100);return {name:e.display_name,amount:Math.max(0,cents)/100,eligible:cents>0,hasAccount:!!e.linked_user_id}});return NextResponse.json({week,approvedDays:days.filter(d=>d.status==="finalized").length,eligible:result.filter(e=>e.eligible).length,missingAccount:result.filter(e=>e.eligible&&!e.hasAccount).length,employees:result,notificationsSent:false});
}