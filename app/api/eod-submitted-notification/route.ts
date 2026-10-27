import {NextRequest,NextResponse} from "next/server";
import webpush from "web-push";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co";
const publicKey="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export async function POST(request:NextRequest){
 try{
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  if(!token)return NextResponse.json({error:"Sign in required"},{status:401});
  const h={apikey:publicKey,Authorization:"Bearer "+token};
  const me=await fetch(base+"/auth/v1/user",{headers:h,cache:"no-store"});
  if(!me.ok)return NextResponse.json({error:"Session expired"},{status:401});
  const user=await me.json();
  const profileResponse=await fetch(base+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=display_name,access_role",{headers:h,cache:"no-store"});
  const profile=profileResponse.ok?(await profileResponse.json())[0]:null;
  if(!["manager","admin"].includes(profile?.access_role))return NextResponse.json({error:"Manager access required"},{status:403});
  const {businessDate}=await request.json();
  if(typeof businessDate!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(businessDate))return NextResponse.json({error:"Invalid date"},{status:400});
  const reportResponse=await fetch(base+"/rest/v1/eod_reports?business_date=eq."+encodeURIComponent(businessDate)+"&status=eq.submitted&select=business_date,manager_name,status&limit=1",{headers:h,cache:"no-store"});
  if(!reportResponse.ok)return NextResponse.json({error:"Unable to verify submitted EOD"},{status:502});
  const report=(await reportResponse.json())[0];
  if(!report)return NextResponse.json({error:"EOD has not been submitted"},{status:409});
  if(report.manager_name!==profile.display_name)return NextResponse.json({error:"Only the submitting manager can trigger this notification"},{status:403});
  const secret=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!secret||!process.env.VAPID_PUBLIC_KEY||!process.env.VAPID_PRIVATE_KEY)return NextResponse.json({error:"Owner push delivery is not configured"},{status:503});
  const adminHeaders={apikey:secret,Authorization:"Bearer "+secret};
  const ownerResponse=await fetch(base+"/rest/v1/staff_profiles?email=eq.natebarry11%40gmail.com&access_role=eq.admin&select=user_id&limit=1",{headers:adminHeaders,cache:"no-store"});
  if(!ownerResponse.ok)return NextResponse.json({error:"Owner lookup unavailable"},{status:502});
  const ownerId=(await ownerResponse.json())[0]?.user_id;
  if(!ownerId)return NextResponse.json({error:"Owner not found"},{status:502});
  const subscriptions=await fetch(base+"/rest/v1/staff_push_subscriptions?user_id=eq."+encodeURIComponent(ownerId)+"&select=subscription",{headers:adminHeaders,cache:"no-store"});
  if(!subscriptions.ok)return NextResponse.json({error:"Unable to retrieve owner devices"},{status:502});
  webpush.setVapidDetails(process.env.VAPID_SUBJECT||"mailto:natebarry11@gmail.com",process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
  const name=report.manager_name||"A manager";
  const payload=JSON.stringify({title:"EOD Submitted — "+name,body:name+" submitted the EOD for "+businessDate+". Tap to review.",url:"/manager/eod-finals",tag:"eod-"+businessDate});
  let sent=0;
  for(const row of await subscriptions.json()){try{await webpush.sendNotification(row.subscription,payload);sent++}catch(e){console.error("Owner EOD push failed",e)}}
  return NextResponse.json({ok:true,sent});
 }catch(e){console.error("EOD notification error",e);return NextResponse.json({error:"Unable to notify owner"},{status:500})}
}
