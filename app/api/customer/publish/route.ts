import {NextRequest,NextResponse} from "next/server";
const BASE="https://xtuhannfnvsvvahrzyxj.supabase.co";
const publishedFields=["event_name","event_date","start_time","end_time","guest_count","location","event_type","service_style","status","deposit_amount","deposit_paid","contract_status","customer_name","inquiry_source"];
export async function POST(req:NextRequest){
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY,token=req.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!key||!token)return NextResponse.json({error:"Sign in required"},{status:401});
 let eventId="";try{eventId=String((await req.json()).eventId||"")}catch{}
 if(!/^[0-9a-f-]{36}$/i.test(eventId))return NextResponse.json({error:"Invalid event"},{status:400});
 const h={apikey:key,Authorization:"Bearer "+key};
 const u=await fetch(BASE+"/auth/v1/user",{headers:{apikey:key,Authorization:"Bearer "+token},cache:"no-store"});
 if(!u.ok)return NextResponse.json({error:"Unauthorized"},{status:401});
 const user=await u.json();
 const p=await fetch(BASE+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role",{headers:h,cache:"no-store"});
 const profile=p.ok?(await p.json())[0]:null;
 if(!["admin","manager"].includes(profile?.access_role))return NextResponse.json({error:"Manager access required"},{status:403});
 const r=await fetch(BASE+"/rest/v1/catering_events?id=eq."+eventId+"&select="+publishedFields.join(",")+",customer_portal_enabled",{headers:h,cache:"no-store"});
 if(!r.ok)return NextResponse.json({error:"Unable to load event"},{status:502});
 const event=(await r.json())[0];if(!event)return NextResponse.json({error:"Event not found"},{status:404});
 if(!event.customer_portal_enabled)return NextResponse.json({error:"Enable customer portal access first"},{status:400});
 const snapshot=Object.fromEntries(publishedFields.map(k=>[k,event[k]]));
 const update=await fetch(BASE+"/rest/v1/catering_events?id=eq."+eventId,{method:"PATCH",headers:{...h,"Content-Type":"application/json",Prefer:"return=representation"},body:JSON.stringify({customer_portal_published_data:snapshot,customer_portal_published_at:new Date().toISOString()})});
 if(!update.ok)return NextResponse.json({error:"Unable to publish customer portal"},{status:502});
 return NextResponse.json({ok:true,published_at:(await update.json())[0]?.customer_portal_published_at},{headers:{"Cache-Control":"no-store"}});
}
