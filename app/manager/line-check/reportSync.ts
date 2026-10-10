const base="https://xtuhannfnvsvvahrzyxj.supabase.co/rest/v1/line_check_reports";
const key="sb_publishable_IygQd5vrXido1h8FMRjuaA_QrNzgFEC";
const localKey="robertos-line-check-reports";
function headers(){const session=JSON.parse(sessionStorage.getItem("robertos_auth")||"null");if(!session?.access_token)throw Error("Please sign in again.");return {apikey:key,Authorization:"Bearer "+session.access_token,"Content-Type":"application/json"}}
export function localReports():any[]{try{const value=JSON.parse(localStorage.getItem(localKey)||"[]");return Array.isArray(value)?value:[]}catch{return []}}
export async function uploadReport(report:any){const response=await fetch(base+"?on_conflict=id",{method:"POST",headers:{...headers(),Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({id:String(report.id),payload:report})});if(!response.ok)throw Error("Report sync failed ("+response.status+").")}
export async function syncReports():Promise<any[]>{
 const local=localReports();const h=headers();
 const deletedResponse=await fetch("https://xtuhannfnvsvvahrzyxj.supabase.co/rest/v1/line_check_report_deletions?select=id",{headers:h,cache:"no-store"});
 if(!deletedResponse.ok)throw Error("Cannot verify deleted reports ("+deletedResponse.status+").");
 const deletedRows:{id:string}[]=await deletedResponse.json();const deletedIds=new Set(deletedRows.map(x=>String(x.id)));
 const existing=await fetch(base+"?select=id,payload&order=updated_at.desc",{headers:h,cache:"no-store"});
 if(!existing.ok)throw Error("Cannot load shared reports ("+existing.status+").");
 const cloudRows:{id:string;payload:any}[]=await existing.json();
 const cloud=new Map(cloudRows.filter(x=>!deletedIds.has(String(x.id))).map(x=>[String(x.id),x.payload]));
 // Upload only records absent from cloud; never replace another manager's validated report with an older local copy.
 const missing=local.filter(x=>!cloud.has(String(x.id))&&!deletedIds.has(String(x.id)));
 if(missing.length){const response=await fetch(base+"?on_conflict=id",{method:"POST",headers:{...h,Prefer:"resolution=ignore-duplicates,return=minimal"},body:JSON.stringify(missing.map(x=>({id:String(x.id),payload:x})))});if(!response.ok)throw Error("Could not import old reports ("+response.status+").");for(const x of missing)cloud.set(String(x.id),x)}
 const merged=[...cloud.values()].sort((a,b)=>new Date(b.date||0).getTime()-new Date(a.date||0).getTime());
 localStorage.setItem(localKey,JSON.stringify(merged));return merged;
}
