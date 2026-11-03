"use client";
import {useState} from "react";
export default function InquiryPage(){
 const [source,setSource]=useState("robertos"),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState("");
 const field:React.CSSProperties={width:"100%",boxSizing:"border-box",background:"#101d2c",border:"1px solid #41516a",borderRadius:9,padding:"12px 13px",color:"#f6f6f6",fontSize:16};
 const label:React.CSSProperties={display:"grid",gap:7,fontSize:14,fontWeight:650};
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setError("");const form=new FormData(e.currentTarget);const body=Object.fromEntries(form.entries());body.source=source;try{const r=await fetch("/api/catering/inquiry",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const data=await r.json();if(!r.ok)throw Error(data.error||"Could not submit inquiry.");setDone(true)}catch(e){setError(String(e instanceof Error?e.message:e))}finally{setBusy(false)}}
 return <main style={{minHeight:"100vh",background:"linear-gradient(135deg,#07111d,#14273d)",color:"#f6f7f9",padding:"36px 16px",fontFamily:"Arial,sans-serif"}}><div style={{maxWidth:680,margin:"0 auto"}}>
 <div style={{textAlign:"center",marginBottom:26}}><div style={{color:"#d7ae72",fontWeight:800,letterSpacing:3,fontSize:13}}>ROBERTO&apos;S</div><h1 style={{fontSize:"clamp(27px,5vw,39px)",margin:"12px 0"}}>Plan Your Event</h1><p style={{color:"#b7c4d2",lineHeight:1.6}}>Tell us about your event and our team will be in touch. This is an inquiry, not a confirmed reservation.</p></div>
 <section style={{background:"#132238",border:"1px solid #344760",borderRadius:16,padding:"clamp(20px,4vw,34px)"}}>
 {done?<div style={{textAlign:"center",padding:"35px 0"}}><h2>Inquiry received!</h2><p style={{color:"#c8d1df"}}>Thank you. Our events team will review your request and contact you soon.</p></div>:<form onSubmit={submit} style={{display:"grid",gap:18}}>
 <label style={label}>Inquiring through<select value={source} onChange={e=>setSource(e.target.value)} style={field}><option value="robertos">Roberto&apos;s American Tavern</option><option value="prime">Roberto&apos;s Prime Catering</option></select></label>
 <label style={label}>Your name *<input name="name" required maxLength={120} style={field}/></label>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16}}><label style={label}>Email *<input name="email" type="email" required style={field}/></label><label style={label}>Phone<input name="phone" type="tel" style={field}/></label></div>
 <label style={label}>What are you celebrating? *<input name="eventType" required placeholder="Birthday, shower, business dinner…" style={field}/></label>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:16}}><label style={label}>Preferred date *<input name="date" type="date" required style={field}/></label><label style={label}>Start time<input name="time" type="time" style={field}/></label><label style={label}>Estimated guests *<input name="guests" type="number" min="1" max="2000" required style={field}/></label></div>
 <label style={label}>Preferred location *<select name="location" required style={field}><option value="Tavern">Tavern</option><option value="Log Cabin">Log Cabin</option><option value="Not sure">Not sure yet</option></select></label>
 <label style={label}>Service preference *<select name="service" required style={field}><option value="unsure">Not sure yet</option><option value="buffet">Buffet</option><option value="off_menu">Off Menu</option><option value="catering_offsite">Catering Offsite</option><option value="delivery">Delivery</option><option value="pickup">Pickup</option></select></label>
 <label style={label}>Additional details<textarea name="notes" rows={4} maxLength={2000} placeholder="Tell us about your event, special requests or questions." style={{...field,resize:"vertical"}}/></label>
 <label style={{position:"absolute",left:"-9999px"}} aria-hidden="true">Leave blank<input name="website" tabIndex={-1} autoComplete="off"/></label>
 {error&&<p role="alert" style={{color:"#ffb5b5",margin:0}}>{error}</p>}
 <button disabled={busy} style={{background:"#d4a66b",color:"#142033",border:0,borderRadius:10,padding:15,fontSize:16,fontWeight:800,cursor:"pointer"}}>{busy?"Sending…":"Submit Event Inquiry"}</button>
 </form>}</section></div></main>
}