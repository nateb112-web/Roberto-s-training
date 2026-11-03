import {NextRequest,NextResponse} from "next/server";
const BASE="https://xtuhannfnvsvvahrzyxj.supabase.co";
export async function GET(req:NextRequest){
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!token)return NextResponse.json({error:"Sign in required"},{status:401});
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!service)return NextResponse.json({error:"Customer portal unavailable"},{status:503});
 const userRes=await fetch(BASE+"/auth/v1/user",{headers:{apikey:service,Authorization:"Bearer "+token},cache:"no-store"});
 if(!userRes.ok)return NextResponse.json({error:"Invalid or expired sign-in link"},{status:401});
 const user=await userRes.json();
 if(!user.email||!user.email_confirmed_at)return NextResponse.json({error:"Email verification required"},{status:403});
 const email=String(user.email).trim().toLowerCase();
 const res=await fetch(BASE+"/rest/v1/catering_events?select=id,event_name,event_date,start_time,end_time,guest_count,location,event_type,service_style,status,deposit_amount,deposit_paid,contract_status,customer_name,customer_email,inquiry_source&customer_portal_enabled=eq.true&customer_email=ilike."+encodeURIComponent(email)+"&order=event_date.desc",{headers:{apikey:service,Authorization:"Bearer "+service},cache:"no-store"});
 if(!res.ok)return NextResponse.json({error:"Unable to load your events"},{status:502});
 const events=await res.json();
 return NextResponse.json({events},{headers:{"Cache-Control":"private, no-store"}});
}
