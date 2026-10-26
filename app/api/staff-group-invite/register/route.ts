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
  return NextResponse.json({success:true});
 }catch{return NextResponse.json({error:"Registration failed."},{status:500})}
}