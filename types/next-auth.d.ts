// types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isAdmin: boolean;
      phone: string;       
      createdAt: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    isAdmin: boolean;
    phone: string;        
    createdAt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isAdmin: boolean;
    phone: string;        
    createdAt: string;
  }
}