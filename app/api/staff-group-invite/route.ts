import {NextRequest,NextResponse} from "next/server";
import {randomBytes,createHash} from "node:crypto";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co";
const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
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
  if(!key)return NextResponse.json({error:"Group invitations are not configured yet"},{status:503});
  const token=randomBytes(32).toString("hex");
  const token_hash=createHash("sha256").update(token).digest("hex");
  const saved=await fetch(base+"/rest/v1/staff_group_invites",{method:"POST",headers:{apikey:key,Authorization:"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({token_hash,created_by:user.id,expires_at:new Date(Date.now()+7*86400000).toISOString()})});
  if(!saved.ok)return NextResponse.json({error:"Group invitation storage is not configured yet"},{status:503});
  return NextResponse.json({url:new URL("/join?invite="+token,request.nextUrl.origin).toString()});
 }catch{return NextResponse.json({error:"Unable to create invite"},{status:500})}
}