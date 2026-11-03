import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
export const runtime="nodejs";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co/rest/v1/";
const allowed=new Set(["robertos","prime"]);
const reply=(message:string,status:number)=>NextResponse.json({error:message},{status});
export async function POST(request:NextRequest){
 try{
  const body=await request.json();
  if(body.website)return NextResponse.json({ok:true});
  const str=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
  const source=str(body.source,30);
  const name=str(body.name,120),email=str(body.email,180),phone=str(body.phone,40),date=str(body.date,10),time=str(body.time,5),guests=Number(body.guests),notes=str(body.notes,2000),eventType=str(body.eventType,60);
  if(!allowed.has(source)||name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isInteger(guests)||guests<1||guests>2000||!eventType)return reply("Please complete all required fields.",400);
  const dateValue=new Date(date+"T12:00:00Z");
  if(Number.isNaN(dateValue.getTime())||dateValue.toISOString().slice(0,10)!==date||dateValue.getTime()<Date.now()-86400000)return reply("Choose a future event date.",400);
  if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))return reply("Invalid event time.",400);
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!key)return reply("Inquiry service is not configured.",503);
  const headers={apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"};
  const ip=request.headers.get("x-real-ip")||request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown";
  const fingerprint=createHash("sha256").update(ip+"|"+email.toLowerCase()).digest("hex");
  const bucket=new Date(Math.floor(Date.now()/300000)*300000).toISOString();
  const rate=await fetch(base+"catering_inquiry_rate_limits",{method:"POST",headers,body:JSON.stringify({fingerprint,bucket}),cache:"no-store"});
  if(rate.status===409)return reply("Please wait a few minutes before sending another inquiry.",429);
  if(!rate.ok)return reply("Unable to accept inquiry right now.",503);
  const record={event_name:eventType+" inquiry — "+name,customer_name:name,customer_email:email,customer_phone:phone||null,event_type:"in_house",service_style:"buffet",event_date:date,start_time:time||null,guest_count:guests,location:"To be determined",status:"new_inquiry",deposit_amount:0,deposit_paid:false,contract_status:"not_sent",special_requests:notes||null,menu_notes:"Service preference to be determined during inquiry review.",inquiry_source:source};
  const saved=await fetch(base+"catering_events",{method:"POST",headers:{...headers,Prefer:"return=minimal"},body:JSON.stringify(record),cache:"no-store"});
  if(!saved.ok){console.error("Inquiry insert failed",saved.status,(await saved.text()).slice(0,400));return reply("Could not submit your inquiry. Please try again.",503)}
  return NextResponse.json({ok:true});
 }catch{return reply("Unable to process inquiry.",400)}
}