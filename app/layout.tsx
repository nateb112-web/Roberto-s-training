import "./globals.css";
import AuthGate from "./components/AuthGate";
export const metadata={title:"Roberto's Training",description:"Roberto's American Tavern employee learning"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AuthGate>{children}</AuthGate></body></html>}