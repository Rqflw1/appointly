import { Logo } from "@/app/_prisma/browser";

export interface LogoWithUrl extends Logo {
  url: string;
}

export enum LogoAction {
  CREATE = "CREATE",
  CONNECT = "CONNECT",
  DISCONNECT = "DISCONNECT",
  KEEP = "KEEP"
}
