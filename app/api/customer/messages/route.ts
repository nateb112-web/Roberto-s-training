import {NextRequest,NextResponse} from "next/server";
const BASE="https://xtuhannfnvsvvahrzyxj.supabase.co";
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
async function authorize(req:NextRequest,eventId:string){
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!service||!token)return null;
 const h={apikey:service,Authorization:"Bearer "+service};
 const u=await fetch(BASE+"/auth/v1/user",{headers:{apikey:service,Authorization:"Bearer "+token},cache:"no-store"});
 if(!u.ok)return null;
 const user=await u.json();
 if(!user.email_confirmed_at)return null;
 const eventRes=await fetch(BASE+"/rest/v1/catering_events?id=eq."+encodeURIComponent(eventId)+"&select=id,customer_email,customer_portal_enabled",{headers:h,cache:"no-store"});
 if(!eventRes.ok)return null;
 const event=(await eventRes.json())[0];
 if(!event)return null;
 const profileRes=await fetch(BASE+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role,display_name",{headers:h,cache:"no-store"});
 const profile=profileRes.ok?(await profileRes.json())[0]:null;
 const staff=Boolean(profile&&(["admin","manager"].includes(profile.access_role)&&["natebarry11@gmail.com","christaf777@gmail.com"].includes((user.email||"").toLowerCase())));
 const customer=Boolean(event.customer_portal_enabled&&event.customer_email&&event.customer_email.trim().toLowerCase()===String(user.email||"").trim().toLowerCase());
 if(!staff&&!customer)return null;
 return {h,staff,name:staff?(profile?.display_name||"Roberto’s Events"):"Customer"};
}
export async function GET(req:NextRequest){const eventId=req.nextUrl.searchParams.get("eventId")||"";if(!/^[0-9a-f-]{36}$/i.test(eventId))return json({error:"Invalid event"},400);const access=await authorize(req,eventId);if(!access)return json({error:"Access denied"},403);const r=await fetch(BASE+"/rest/v1/catering_customer_messages?event_id=eq."+encodeURIComponent(eventId)+"&select=id,event_id,sender,body,created_at&order=created_at.asc&limit=300",{headers:access.h,cache:"no-store"});if(!r.ok)return json({error:"Unable to load messages"},502);return json({messages:await r.json()})}
export async function POST(req:NextRequest){let input;try{input=await req.json()}catch{return json({error:"Invalid request"},400)}const eventId=String(input.eventId||"");const body=String(input.body||"").trim();if(!/^[0-9a-f-]{36}$/i.test(eventId)||!body||body.length>2000)return json({error:"Message must be between 1 and 2000 characters"},400);const access=await authorize(req,eventId);if(!access)return json({error:"Access denied"},403);const r=await fetch(BASE+"/rest/v1/catering_customer_messages",{method:"POST",headers:{...access.h,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({event_id:eventId,sender:access.staff?"staff":"customer",body})});if(!r.ok)return json({error:"Unable to send message"},502);return json({message:(await r.json())[0]},201)}
