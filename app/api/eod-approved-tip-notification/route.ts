import {NextRequest,NextResponse} from "next/server";
import webpush from "web-push";

const base="https://xtuhannfnvsvvahrzyxj.supabase.co";
const publicKey="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
const response=(error:string,status:number)=>NextResponse.json({error},{status});
type Tip={recipient?:string;amount?:number};
type Entry={name?:string;cashOwedEmployee?:number;tipouts?:Tip[]};

export async function POST(request:NextRequest){
 try{
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  if(!token)return response("Sign in required",401);
  const h={apikey:publicKey,Authorization:"Bearer "+token};
  const me=await fetch(base+"/auth/v1/user",{headers:h,cache:"no-store"});
  if(!me.ok)return response("Session expired",401);
  const user=await me.json();
  const roleResponse=await fetch(base+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role",{headers:h,cache:"no-store"});
  if(!roleResponse.ok||(await roleResponse.json())[0]?.access_role!=="admin")return response("Administrator only",403);
  const {businessDate}=await request.json();
  if(typeof businessDate!=="string"||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(businessDate))return response("Invalid business date",400);
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!secret||!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY)return response("Push delivery is not configured",503);
  const adminHeaders={apikey:secret,Authorization:"Bearer "+secret,"Content-Type":"application/json"};
  const reportResponse=await fetch(base+"/rest/v1/eod_reports?business_date=eq."+businessDate+"&status=eq.finalized&select=business_date,entries&limit=1",{headers:adminHeaders,cache:"no-store"});
  if(!reportResponse.ok)return response("Could not verify approved EOD",502);
  const report=(await reportResponse.json())[0];
  if(!report)return response("EOD must be approved before notifying employees",409);
  const eligible=new Set<string>();
  for(const entry of (report.entries||[]) as (Entry & {takeout?:boolean})[]){
   const name=entry.name?.trim();
   if(!name||/^(AM|PM)\s+Takeout$/i.test(name))continue;
   eligible.add(name.toLocaleLowerCase("en-US"));
   for(const tip of entry.tipouts||[])if(Number(tip.amount||0)>0&&tip.recipient?.trim())eligible.add(tip.recipient.trim().toLocaleLowerCase("en-US"));
  }
  if(!eligible.size)return NextResponse.json({ok:true,eligible:0,sent:0});
  const profilesResponse=await fetch(base+"/rest/v1/staff_profiles?select=user_id,display_name,access_role",{headers:adminHeaders,cache:"no-store"});
  if(!profilesResponse.ok)return response("Could not identify staff recipients",502);
  const profiles=(await profilesResponse.json()) as {user_id:string;display_name:string;access_role:string}[];
  const day=new Date(businessDate+"T12:00:00Z").toLocaleDateString("en-US",{weekday:"long",timeZone:"UTC"});
  webpush.setVapidDetails(process.env.VAPID_SUBJECT||"mailto:natebarry11@gmail.com",process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
  let sent=0,alreadyNotified=0,withoutDevices=0;
  for(const profile of profiles){
   if(!eligible.has(profile.display_name?.trim().toLocaleLowerCase("en-US")))continue;
   const subscriptionsResponse=await fetch(base+"/rest/v1/staff_push_subscriptions?user_id=eq."+encodeURIComponent(profile.user_id)+"&select=subscription",{headers:adminHeaders,cache:"no-store"});
   if(!subscriptionsResponse.ok)continue;
   const subscriptions=await subscriptionsResponse.json();
   if(!subscriptions.length){withoutDevices++;continue;}
   // Atomic uniqueness prevents duplicate sends from concurrent approval requests.
   const claim=await fetch(base+"/rest/v1/eod_tip_notification_deliveries",{method:"POST",headers:{...adminHeaders,Prefer:"return=minimal"},body:JSON.stringify({business_date:businessDate,user_id:profile.user_id})});
   if(claim.status===409){alreadyNotified++;continue;}
   if(!claim.ok)continue; // Fail closed if delivery ledger is not installed.
   const payload=JSON.stringify({title:"Roberto's Staff",body:"Your Tips from "+day+" are ready to be viewed",url:"/my-earnings",tag:"eod-tips-"+businessDate});
   const results=await Promise.allSettled(subscriptions.map((s:{subscription:webpush.PushSubscription})=>webpush.sendNotification(s.subscription,payload)));
   if(results.some(r=>r.status==="fulfilled"))sent++;
  }
  return NextResponse.json({ok:true,eligible:eligible.size,sent,alreadyNotified,withoutDevices});
 }catch(e){console.error("EOD approved tip notification failed",e);return response("Unable to send tip notifications",500)}
}
