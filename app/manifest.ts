import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
 return {name:"Roberto's Staff",short_name:"Roberto's",description:"Roberto's Tavern staff portal",start_url:"/login",scope:"/",display:"standalone",background_color:"#11191d",theme_color:"#11191d",icons:[{src:"/staff-icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"},{src:"/staff-icon-maskable.svg",sizes:"any",type:"image/svg+xml",purpose:"maskable"}]};
}