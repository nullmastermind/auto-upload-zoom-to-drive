import dynamic from "next/dynamic";

export default dynamic(() => import("./Dynamic"), { ssr: false });
