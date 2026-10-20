// lib/prisma.js
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global;

function createPrismaClient() {
  return new PrismaClient({
    log: ["error"],
    errorFormat: "minimal",
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}