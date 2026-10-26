import {NextRequest,NextResponse} from "next/server";
const base="https://xtuhannfnvsvvahrzyxj.supabase.co";
const key="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export async function POST(request:NextRequest){
 try{
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/i,"");
  if(!token)return NextResponse.json({error:"Sign in required"},{status:401});
  const headers={apikey:key,Authorization:"Bearer "+token};
  const userResponse=await fetch(base+"/auth/v1/user",{headers,cache:"no-store"});
  if(!userResponse.ok)return NextResponse.json({error:"Session expired"},{status:401});
  const user=await userResponse.json();
  const profileResponse=await fetch(base+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=email,access_role",{headers,cache:"no-store"});
  if(!profileResponse.ok)return NextResponse.json({error:"Unable to verify owner"},{status:403});
  const profile=(await profileResponse.json())[0];
  if(profile?.access_role!=="admin"||profile?.email?.toLowerCase()!=="natebarry11@gmail.com")return NextResponse.json({error:"Owner only"},{status:403});
  if(!process.env.RESEND_API_KEY)return NextResponse.json({error:"Email service is not configured"},{status:503});
  const sent=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({
   from:"Roberto's Staff <notifications@robertosct.com>",
   to:["natebarry11@gmail.com"],
   subject:"TEST — New Roberto's Staff account notification",
   text:"This is a test notification. No staff account was created.\\n\\nYour new-account email alerts are configured to notify only you.\\n\\nhttps://staff.robertosct.com/manager/employees"
  })});
  if(!sent.ok){console.error("Test notification delivery request failed",sent.status);return NextResponse.json({error:"Email provider rejected the test. Check sender domain verification."},{status:502})}
  return NextResponse.json({ok:true,message:"Test email accepted by the email provider. Check your inbox and spam folder."});
 }catch{return NextResponse.json({error:"Unable to send test email"},{status:500})}
}
