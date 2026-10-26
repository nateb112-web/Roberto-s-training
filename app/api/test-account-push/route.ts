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
  const profileRes=await fetch(base+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=email,access_role",{headers,cache:"no-store"});
  const profile=profileRes.ok?(await profileRes.json())[0]:null;
  if(profile?.access_role!=="admin"||profile?.email?.toLowerCase()!=="natebarry11@gmail.com")return NextResponse.json({error:"Owner only"},{status:403});
  const publicKey=process.env.VAPID_PUBLIC_KEY,privateKey=process.env.VAPID_PRIVATE_KEY;
  if(!publicKey||!privateKey)return NextResponse.json({error:"Push is not configured"},{status:503});
  const subscriptions=await fetch(base+"/rest/v1/staff_push_subscriptions?user_id=eq."+encodeURIComponent(user.id)+"&select=subscription",{headers,cache:"no-store"});
  if(!subscriptions.ok)return NextResponse.json({error:"Unable to load your devices"},{status:502});
  const rows=await subscriptions.json();
  if(!rows.length)return NextResponse.json({error:"Enable Push Notifications in Account Settings first"},{status:400});
  webpush.setVapidDetails(process.env.VAPID_SUBJECT||"mailto:natebarry11@gmail.com",publicKey,privateKey);
  let sent=0;
  for(const row of rows){try{await webpush.sendNotification(row.subscription,JSON.stringify({title:"Roberto's Staff — Test Notification",body:"Your new staff account push alerts are working. No account was created.",url:"/manager/employees"}));sent++}catch(e){console.error("Test push delivery failed",e)}}
  if(!sent)return NextResponse.json({error:"No devices accepted the notification. Re-enable push in Account Settings."},{status:502});
  return NextResponse.json({ok:true,message:"Test push sent to "+sent+" device(s)."});
 }catch(e){console.error("Test push failed",e);return NextResponse.json({error:"Unable to send push notification"},{status:500})}
}
