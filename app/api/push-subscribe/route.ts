import {NextRequest,NextResponse} from "next/server";
const API="https://xtuhannfnvsvvahrzyxj.supabase.co",KEY="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
export async function POST(req:NextRequest){
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"");if(!token)return NextResponse.json({error:"Sign in required"},{status:401});
 const headers={apikey:KEY,Authorization:"Bearer "+token};
 const me=await fetch(API+"/auth/v1/user",{headers,cache:"no-store"});if(!me.ok)return NextResponse.json({error:"Invalid session"},{status:401});
 const user=await me.json();
 const body=await req.json(),sub=body.subscription;
 if(!sub?.endpoint?.startsWith("https://")||!sub?.keys?.p256dh||!sub?.keys?.auth)return NextResponse.json({error:"Invalid subscription"},{status:400});
 const r=await fetch(API+"/rest/v1/staff_push_subscriptions?on_conflict=endpoint",{method:"POST",headers:{...headers,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({user_id:user.id,endpoint:sub.endpoint,subscription:sub})});
 if(!r.ok)return NextResponse.json({error:"Unable to register phone"},{status:500});
 return NextResponse.json({ok:true});
}