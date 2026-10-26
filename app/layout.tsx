import "./globals.css";
import "./robertos-dark.css";
import type { Metadata, Viewport } from "next";
import AuthGate from "./components/AuthGate";
export const metadata: Metadata={title:"Roberto's Staff",description:"Roberto's Tavern staff portal",applicationName:"Roberto's Staff",appleWebApp:{capable:true,statusBarStyle:"black-translucent",title:"Roberto's Staff"},icons:{icon:"/staff-icon.svg",apple:"/staff-icon.svg"}};
export const viewport: Viewport={themeColor:"#11191d",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AuthGate>{children}</AuthGate></body></html>}