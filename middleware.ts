import {NextRequest,NextResponse} from "next/server";
export function middleware(request:NextRequest){
 const host=(request.headers.get("host")||"").split(":")[0].toLowerCase();
 const path=request.nextUrl.pathname;
 if(host!=="events.robertosct.com")return NextResponse.next();
 if(path==="/"||path==="/customer")return NextResponse.rewrite(new URL("/customer",request.url));
 if(path.startsWith("/api/customer/")||path.startsWith("/_next/")||path==="/favicon.ico")return NextResponse.next();
 return NextResponse.redirect(new URL("/",request.url));
}
export const config={matcher:["/((?!_next/static|_next/image).*)"]};
