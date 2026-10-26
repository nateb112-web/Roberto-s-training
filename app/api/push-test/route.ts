import {NextRequest,NextResponse} from "next/server";
import webpush from "web-push";
const API="https://xtuhannfnvsvvahrzyxj.supabase.co";
const KEY="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
function error(message:string,status=400){return NextResponse.json({error:message},{status})}
export async function POST(req:NextRequest){
 try{
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!token)return error("Sign in required",401);
 const h={apikey:KEY,Authorization:"Bearer "+token};
 const me=await fetch(API+"/auth/v1/user",{headers:h,cache:"no-store"});
 if(!me.ok)return error("Invalid session",401);
 const user=await me.json();
 const profile=await fetch(API+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=email,access_role",{headers:h,cache:"no-store"});
 if(!profile.ok)return error("Could not verify admin",403);
 const rows=await profile.json();
 if(rows[0]?.email?.toLowerCase()!=="natebarry11@gmail.com"||rows[0]?.access_role!=="admin")return error("Owner only",403);
 const body=await req.json();
 if(body.action==="subscribe"){
 const sub=body.subscription;
 if(!sub?.endpoint||!sub?.keys?.p256dh||!sub?.keys?.auth||typeof sub.endpoint!=="string"||!sub.endpoint.startsWith("https://"))return error("Invalid subscription");
 const save=await fetch(API+"/rest/v1/staff_push_subscriptions?on_conflict=endpoint",{method:"POST",headers:{...h,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({user_id:user.id,endpoint:sub.endpoint,subscription:sub})});
 if(!save.ok)return error("Unable to register phone: "+(await save.text()).slice(0,100),500);
 return NextResponse.json({ok:true});
 }
 if(body.action==="test"){
 const lookup=await fetch(API+"/rest/v1/staff_push_subscriptions?user_id=eq."+encodeURIComponent(user.id)+"&select=subscription",{headers:h,cache:"no-store"});
 if(!lookup.ok)return error("Unable to find subscriptions",500);
 const subscriptions=await lookup.json();
 if(!subscriptions.length)return error("Register your phone first.");
 if(!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY)return error("Push keys not configured",500);
 webpush.setVapidDetails(process.env.VAPID_SUBJECT||"mailto:natebarry11@gmail.com",process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
 const payload=JSON.stringify({title:"Roberto's Staff — Test",body:"Your check for $245.75 is ready to be picked up!",tag:"paycheck-remote-test",url:"/manager"});
 const results=await Promise.allSettled(subscriptions.map((x:{subscription:webpush.PushSubscription})=>webpush.sendNotification(x.subscription,payload)));
 const sent=results.filter(x=>x.status==="fulfilled").length;
 return NextResponse.json({ok:sent>0,sent,total:results.length,error:sent?"":"No registered phone accepted the push notification"});
 }
 return error("Unknown action");
 }catch(e){return error(e instanceof Error?e.message:"Notification failed",500)}
}