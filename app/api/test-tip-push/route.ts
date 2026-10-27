import {NextRequest,NextResponse} from "next/server";
import webpush from "web-push";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co";
const key="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export async function POST(req:NextRequest){
 try{
  const token=req.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  if(!token)return NextResponse.json({error:"Sign in required"},{status:401});
  const headers={apikey:key,Authorization:"Bearer "+token};
  const me=await fetch(base+"/auth/v1/user",{headers,cache:"no-store"});
  if(!me.ok)return NextResponse.json({error:"Session expired"},{status:401});
  const user=await me.json();
  const p=await fetch(base+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=email,access_role",{headers,cache:"no-store"});
  const profile=p.ok?(await p.json())[0]:null;
  if(profile?.access_role!=="admin"||profile?.email?.toLowerCase()!=="natebarry11@gmail.com")return NextResponse.json({error:"Owner only"},{status:403});
  if(!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY)return NextResponse.json({error:"Push is not configured"},{status:503});
  const subs=await fetch(base+"/rest/v1/staff_push_subscriptions?user_id=eq."+encodeURIComponent(user.id)+"&select=subscription",{headers,cache:"no-store"});
  if(!subs.ok)return NextResponse.json({error:"Could not load your devices"},{status:502});
  const rows=await subs.json();
  if(!rows.length)return NextResponse.json({error:"Enable push notifications on your device first"},{status:400});
  webpush.setVapidDetails(process.env.VAPID_SUBJECT||"mailto:natebarry11@gmail.com",process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
  const payload=JSON.stringify({title:"Roberto's Staff",body:"Your Tips from Monday are ready to be viewed",url:"/my-earnings",tag:"test-eod-tips"});
  const results=await Promise.allSettled(rows.map((row:{subscription:webpush.PushSubscription})=>webpush.sendNotification(row.subscription,payload)));
  const sent=results.filter(x=>x.status==="fulfilled").length;
  return sent?NextResponse.json({ok:true,message:"Tip notification sent to "+sent+" of your devices. No EOD records changed."}):NextResponse.json({error:"No devices accepted the test push. Re-enable notifications on your device."},{status:502});
 }catch(e){console.error("Tip test push failed",e);return NextResponse.json({error:"Unable to send test push"},{status:500})}
}
