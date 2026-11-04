import {NextRequest,NextResponse} from "next/server";
const BASE="https://xtuhannfnvsvvahrzyxj.supabase.co";
const respond=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
export async function GET(req:NextRequest){
 const eventId=req.nextUrl.searchParams.get("eventId")||"";
 if(!/^[0-9a-f-]{36}$/i.test(eventId))return respond({error:"Invalid booking"},400);
 const service=process.env.SUPABASE_SERVICE_ROLE_KEY;
 const token=req.headers.get("authorization")?.replace(/^Bearer /i,"");
 if(!service||!token)return respond({error:"Unauthorized"},401);
 const userResponse=await fetch(BASE+"/auth/v1/user",{headers:{apikey:service,Authorization:"Bearer "+token},cache:"no-store"});
 if(!userResponse.ok)return respond({error:"Unauthorized"},401);
 const user=await userResponse.json();
 const email=String(user.email||"").toLowerCase();
 if(!user.email_confirmed_at||!["natebarry11@gmail.com","christaf777@gmail.com"].includes(email))return respond({error:"Access denied"},403);
 const h={apikey:service,Authorization:"Bearer "+service};
 const profileResponse=await fetch(BASE+"/rest/v1/staff_profiles?user_id=eq."+encodeURIComponent(user.id)+"&select=access_role",{headers:h,cache:"no-store"});
 if(!profileResponse.ok)return respond({error:"Access denied"},403);
 const profile=(await profileResponse.json())[0];
 if(!["admin","manager"].includes(profile?.access_role))return respond({error:"Access denied"},403);
 const result=await fetch(BASE+"/rest/v1/catering_event_history?event_id=eq."+encodeURIComponent(eventId)+"&select=id,changed_at,operation,changed_by,previous_data,current_data&order=id.desc&limit=100",{headers:h,cache:"no-store"});
 if(!result.ok)return respond({error:"Unable to load booking history"},502);
 return respond({history:await result.json()});
}
