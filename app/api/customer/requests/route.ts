import {NextRequest,NextResponse} from "next/server";
const BASE="https://xtuhannfnvsvvahrzyxj.supabase.co";
const reply=(x:unknown,status=200)=>NextResponse.json(x,{status,headers:{"Cache-Control":"no-store"}});
const fields:Record<string,string>={guest_count:"guest_count",start_time:"start_time",end_time:"end_time",event_date:"event_date",location:"location"};
async function auth(req:NextRequest,eventId:string){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY,token=req.headers.get("authorization")?.replace(/^Bearer /i,"");if(!key||!token)return null;
 const h={apikey:key,Authorization:"Bearer "+key};
 const u=await fetch(BASE+"/auth/v1/user",{headers:{apikey:key,Authorization:"Bearer "+token},cache:"no-store"});if(!u.ok)return null;const user=await u.json();if(!user.email_confirmed_at)return null;
 const e=await fetch(BASE+"/rest/v1/catering_events?id=eq."+encodeURIComponent(eventId)+"&select=id,customer_email,customer_portal_enabled,guest_count,start_time,end_time,event_date,location",{headers:h,cache:"no-store"});if(!e.ok)return null;const event=(await e.json())[0];if(!event)return null;
 const p=await fetch(BASE+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role",{headers:h,cache:"no-store"});const profile=p.ok?(await p.json())[0]:null;
 const staff=profile?.access_role==="admin"||profile?.access_role==="manager";
 const customer=event.customer_portal_enabled&&event.customer_email?.trim().toLowerCase()===String(user.email||"").trim().toLowerCase();
 if(!staff&&!customer)return null;return {h,event,staff,customer};
}
export async function GET(req:NextRequest){const eventId=req.nextUrl.searchParams.get("eventId")||"";if(!/^[0-9a-f-]{36}$/i.test(eventId))return reply({error:"Invalid event"},400);const a=await auth(req,eventId);if(!a)return reply({error:"Access denied"},403);const r=await fetch(BASE+"/rest/v1/catering_customer_requests?event_id=eq."+eventId+"&select=id,event_id,request_type,requested_value,status,created_at,resolved_at&order=created_at.desc&limit=100",{headers:a.h,cache:"no-store"});return r.ok?reply({requests:await r.json()}):reply({error:"Unable to load requests"},502)}
export async function POST(req:NextRequest){let d;try{d=await req.json()}catch{return reply({error:"Invalid JSON"},400)}const eventId=String(d.eventId||""),field=String(d.field||"");if(!/^[0-9a-f-]{36}$/i.test(eventId)||!fields[field])return reply({error:"Invalid request"},400);const a=await auth(req,eventId);if(!a||!a.customer)return reply({error:"Access denied"},403);let value=d.value;
 if(field==="guest_count"){value=Number(value);if(!Number.isInteger(value)||value<1||value>5000)return reply({error:"Invalid guest count"},400)}
 else if(field==="event_date"){if(typeof value!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value)||Number.isNaN(Date.parse(value)))return reply({error:"Invalid date"},400)}
 else if(field==="start_time"||field==="end_time"){if(typeof value!=="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))return reply({error:"Invalid time"},400)}
 else if(typeof value!=="string"||!value.trim()||value.length>100)return reply({error:"Invalid value"},400);
 const note=String(d.note||"").trim().slice(0,1000);
 const r=await fetch(BASE+"/rest/v1/catering_customer_requests",{method:"POST",headers:{...a.h,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({event_id:eventId,request_type:field,requested_value:{value,note},status:"pending"})});return r.ok?reply({request:(await r.json())[0]},201):reply({error:"Unable to submit request"},502)}
export async function PATCH(req:NextRequest){let d;try{d=await req.json()}catch{return reply({error:"Invalid JSON"},400)}const eventId=String(d.eventId||""),id=String(d.id||""),decision=String(d.decision||"");if(!/^[0-9a-f-]{36}$/i.test(eventId)||!/^[0-9a-f-]{36}$/i.test(id)||!["approved","rejected"].includes(decision))return reply({error:"Invalid request"},400);const a=await auth(req,eventId);if(!a?.staff)return reply({error:"Staff access required"},403);
 const r=await fetch(BASE+"/rest/v1/catering_customer_requests?id=eq."+id+"&event_id=eq."+eventId+"&status=eq.pending&select=*",{headers:a.h,cache:"no-store"});const request=r.ok?(await r.json())[0]:null;if(!request)return reply({error:"Request is no longer pending"},409);
 if(decision==="approved"){const field=String(request.request_type);if(!fields[field])return reply({error:"Unsupported field"},400);const value=request.requested_value?.value;if(value===undefined)return reply({error:"Missing value"},400);
 const update=await fetch(BASE+"/rest/v1/catering_events?id=eq."+eventId,{method:"PATCH",headers:{...a.h,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({[field]:value})});if(!update.ok)return reply({error:"Could not update event"},502)}
 const updateRequest=await fetch(BASE+"/rest/v1/catering_customer_requests?id=eq."+id+"&status=eq.pending",{method:"PATCH",headers:{...a.h,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({status:decision,resolved_at:new Date().toISOString()})});return updateRequest.ok?reply({request:(await updateRequest.json())[0]}):reply({error:"Could not finalize request"},502)}
