export const BRANCHES = [
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

export const DIFFICULTIES = {
  easy: { items: 5, capacity: 10, maxWeight: 7, time: 50 },
  normal: { items: 6, capacity: 15, maxWeight: 10, time: 45 },
  hard: { items: 8, capacity: 20, maxWeight: 12, time: 40 },
} as const;

export type Difficulty = keyof typeof DIFFICULTIES;
export type PublicEntry = {
  id: string;
  playerName: string;
  score: number;
  mode: Difficulty;
  branchCode: string | null;
  branchName: string;
  createdAt: string;
};
