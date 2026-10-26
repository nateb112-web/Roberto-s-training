import webpush from "web-push";
import {NextRequest,NextResponse} from "next/server";
import {createHash} from "node:crypto";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co";
const publicKey="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
const allowed=["server","bartender","kitchen","host","busser"];
export async function POST(request:NextRequest){
 try{
  const input=await request.json();
  const invite=String(input.invite||""),name=String(input.name||"").trim(),email=String(input.email||"").trim().toLowerCase(),password=String(input.password||"");
  const positions=input.positions;
  if(!/^[a-f0-9]{64}$/.test(invite)||name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||password.length<8||!Array.isArray(positions)||positions.length<1||positions.length>5||positions.some((x:unknown)=>typeof x!=="string"||!allowed.includes(x))||new Set(positions).size!==positions.length)return NextResponse.json({error:"Please complete all fields correctly."},{status:400});
  const hash=createHash("sha256").update(invite).digest("hex");
  const verify=await fetch(base+"/rest/v1/rpc/staff_group_invite_valid",{method:"POST",headers:{apikey:publicKey,"Content-Type":"application/json"},body:JSON.stringify({p_token_hash:hash}),cache:"no-store"});
  if(!verify.ok||(await verify.json())!==true)return NextResponse.json({error:"Invitation expired or invalid."},{status:403});
  const signup=await fetch(base+"/auth/v1/signup",{method:"POST",headers:{apikey:publicKey,"Content-Type":"application/json"},body:JSON.stringify({email,password,data:{full_name:name,staff_positions:positions,group_invite_hash:hash}})});
  const result=await signup.json();
  if(!signup.ok||!result.user?.id)return NextResponse.json({error:"Unable to register. This email may already have an account."},{status:400});
  const newAccount=Array.isArray(result.user.identities)?result.user.identities.length>0:!!result.user.created_at;
  if(newAccount&&process.env.RESEND_API_KEY){
   try{
    const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({
     from:"Roberto's Staff <notifications@robertosct.com>",
     to:["natebarry11@gmail.com"],
     subject:"New Roberto's Staff account created",
     text:["A new staff account has been created.","Name: "+name,"Email: "+email,"Positions: "+positions.join(", "),"","View: https://staff.robertosct.com/manager/employees"].join("\n")
    })});
    if(!sent.ok)console.error("Owner signup notification failed",sent.status);
   }catch(e){console.error("Owner signup notification error",e)}
  }
  if(newAccount&&process.env.SUPABASE_SERVICE_ROLE_KEY&&process.env.VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY){
   try{
    const owner=await fetch(base+"/rest/v1/staff_profiles?email=eq.natebarry11%40gmail.com&access_role=eq.admin&select=user_id",{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:"Bearer "+process.env.SUPABASE_SERVICE_ROLE_KEY},cache:"no-store"});
    if(owner.ok){
     const ownerId=(await owner.json())[0]?.user_id;
     if(ownerId){
      const subs=await fetch(base+"/rest/v1/staff_push_subscriptions?user_id=eq."+encodeURIComponent(ownerId)+"&select=subscription",{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY,Authorization:"Bearer "+process.env.SUPABASE_SERVICE_ROLE_KEY},cache:"no-store"});
      if(subs.ok){
       webpush.setVapidDetails(process.env.VAPID_SUBJECT||"mailto:natebarry11@gmail.com",process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
       const payload=JSON.stringify({title:"New Employee: "+name,body:name+" joined Roberto's Staff ("+positions.join(", ")+")",url:"/manager/employees",tag:"new-staff-"+result.user.id});
       await Promise.allSettled((await subs.json()).map((row:{subscription:webpush.PushSubscription})=>webpush.sendNotification(row.subscription,payload)));
      }
     }
    }
   }catch(e){console.error("Owner signup push notification failed",e)}
  }
  return NextResponse.json({success:true});
 }catch{return NextResponse.json({error:"Registration failed."},{status:500})}
}