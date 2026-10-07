import { NextResponse } from "next/server";
const TO="robertostavern@gmail.com";
const FROM=process.env.LINE_CHECK_FROM_EMAIL||"Roberto's Line Checks <linechecks@robertosct.com>";
const esc=(v:any)=>String(v??"").replace(/[&<>"]/g,(c)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]||c));
export async function POST(req:Request){
 try{
  const key=process.env.RESEND_API_KEY;
  if(!key)return NextResponse.json({ok:false,error:"Email service is not configured."},{status:503});
  const r=await req.json(); if(!r?.manager||!Array.isArray(r.entries))return NextResponse.json({ok:false,error:"Invalid report."},{status:400});
  const bad=r.entries.filter((e:any)=>e.status==="OUT OF RANGE"),d=new Date(r.date);
  const rows=r.entries.map((e:any)=>"<tr><td>"+esc(e.station)+"</td><td>"+esc(e.item)+"</td><td><b>"+esc(e.temp)+"°F</b></td><td>"+(e.min==null?"Below "+esc(e.max)+"°F":esc(e.min)+"°F – "+esc(e.max)+"°F")+"</td><td class='"+(e.status==="OUT OF RANGE"?"bad":"good")+"'>"+esc(e.status)+"</td><td>"+esc(e.note||"")+"</td></tr>").join("");
  const checks=Array.isArray(r.checks)?r.checks.map((x:any)=>"<tr><td>"+esc(x.label)+"</td><td><b>"+(x.checked?"✓ Complete":"Not complete")+"</b></td></tr>").join(""):"";
  const html="<html><head><style>body{font-family:Arial;color:#1f2933}.wrap{max-width:900px;margin:auto}.head{background:#102431;color:white;padding:22px}table{width:100%;border-collapse:collapse}th,td{padding:9px;border-bottom:1px solid #ddd;text-align:left;font-size:13px}th{background:#f4f6f7}.bad{color:#b71922;font-weight:bold}.good{color:#17733b;font-weight:bold}.alert{background:#fff0f0;border-left:5px solid #b71922;padding:12px}.pass{background:#eef9f1;border-left:5px solid #17733b;padding:12px}</style></head><body><div class='wrap'><div class='head'><b>ROBERTO'S REAL AMERICAN TAVERN</b><h1>Completed Line Check</h1></div><p><b>Manager:</b> "+esc(r.manager)+"<br><b>Date:</b> "+d.toLocaleDateString("en-US",{timeZone:"America/New_York"})+"<br><b>Time:</b> "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",timeZone:"America/New_York"})+"</p><div class='"+(bad.length?"alert":"pass")+"'><b>"+(bad.length?"ACTION REQUIRED: "+bad.length+" temperature(s) outside configured range.":"PASSED: All temperatures within configured ranges.")+"</b></div><br><table><thead><tr><th>Station</th><th>Item</th><th>Temp</th><th>Required</th><th>Status</th><th>Note</th></tr></thead><tbody>"+rows+"</tbody></table>"+(checks?"<h3>Restaurant Checks</h3><table><thead><tr><th>Check</th><th>Status</th></tr></thead><tbody>"+checks+"</tbody></table>":"")+"<h3>Overall Notes</h3><p>"+esc(r.notes||"No overall notes recorded.")+"</p></div></body></html>";
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+key},body:JSON.stringify({from:FROM,to:[TO],subject:(bad.length?"ACTION REQUIRED — ":"")+"Line Check — "+d.toLocaleDateString("en-US",{timeZone:"America/New_York"})+" — "+r.manager,html})});
  const data=await response.json().catch(()=>({}));if(!response.ok)return NextResponse.json({ok:false,error:data.message||"Email provider rejected message."},{status:502});
  return NextResponse.json({ok:true,id:data.id,to:TO});
 }catch{return NextResponse.json({ok:false,error:"Could not send line check email."},{status:500})}
}
