import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const branches = [
  ["DESH", "DESH (FY)"],
  ["CE", "Computer Engineering (CE)"],
  ["CE-SE", "Computer Engineering (Software Engineering)"],
  ["IT", "Information Technology (IT)"],
  ["CSE-AI", "Computer Science & Engineering (Artificial Intelligence)"],
  ["CSE-AIML", "Computer Science & Engineering (Artificial Intelligence & Machine Learning)"],
  ["CSE-DS", "Computer Science & Engineering (Data Science)"],
  ["CSE-IoT", "Computer Science & Engineering (IoT & Cyber Security including Blockchain Technology)"],
  ["AI&DS", "Artificial Intelligence & Data Science (AI&DS)"],
  ["E&TC", "Electronics & Telecommunication Engineering (E&TC)"],
  ["I&CE", "Instrumentation & Control Engineering"],
  ["MECH", "Mechanical Engineering"],
  ["CIVIL", "Civil Engineering"],
] as const;

async function main() {
  for (const [code, name] of branches) {
    await prisma.branch.upsert({ where: { code }, update: { name }, create: { code, name } });
  }
  console.log(`Seeded ${branches.length} branches.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
