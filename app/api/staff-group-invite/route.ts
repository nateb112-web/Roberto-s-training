import {NextRequest,NextResponse} from "next/server";
import {randomBytes,createHash} from "node:crypto";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co";

const publishable="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export async function POST(request:NextRequest){
 try{
  const jwt=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  if(!jwt)return NextResponse.json({error:"Sign in required"},{status:401});
  const me=await fetch(base+"/auth/v1/user",{headers:{apikey:publishable,Authorization:"Bearer "+jwt},cache:"no-store"});
  if(!me.ok)return NextResponse.json({error:"Session expired"},{status:401});
  const user=await me.json();
  const profile=await fetch(base+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role",{headers:{apikey:publishable,Authorization:"Bearer "+jwt},cache:"no-store"});
  if(!profile.ok||(await profile.json())[0]?.access_role!=="admin")return NextResponse.json({error:"Admins only"},{status:403});
  const token=randomBytes(32).toString("hex");
  const token_hash=createHash("sha256").update(token).digest("hex");
  const saved=await fetch(base+"/rest/v1/rpc/create_staff_group_invite",{method:"POST",headers:{apikey:publishable,Authorization:"Bearer "+jwt,"Content-Type":"application/json"},body:JSON.stringify({p_token_hash:token_hash})});
  if(!saved.ok)return NextResponse.json({error:"Unable to save invitation"},{status:503});
  return NextResponse.json({url:"https://staff.robertosct.com/join?invite="+token});
 }catch{return NextResponse.json({error:"Unable to create invite"},{status:500})}
}