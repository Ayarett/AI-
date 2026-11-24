import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type {
  ChatThread,
  DiagnosticAttempt,
  ScheduleConfig,
  ScheduleLesson,
  StudentTask,
  TeacherMaterial,
  UserProfile,
} from "../src/types/platform";

export interface StoredUserRecord {
  profile: UserProfile;
  passwordHash: string;
  recoveryHash: string;
}

export interface UserWorkspaceData {
  scheduleConfig: ScheduleConfig;
  scheduleLessons: ScheduleLesson[];
  tasks: StudentTask[];
  diagnostics: DiagnosticAttempt[];
  chatThreads: ChatThread[];
  teacherMaterials: TeacherMaterial[];
}

interface DatabaseSchema {
  users: Record<string, StoredUserRecord>;
  usernameToId: Record<string, string>;
  workspaces: Record<string, UserWorkspaceData>;
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "ai-ustaz-db.json");
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

function defaultWorkspace(): UserWorkspaceData {
  return {
    scheduleConfig: {
      startTime: "08:00",
      lessonDuration: 40,
      defaultBreak: 5,
      breakAfterSecond: 10,
      breakAfterThird: 10,
    },
    scheduleLessons: [],
    tasks: [],
    diagnostics: [],
    chatThreads: [],
    teacherMaterials: [],
  };
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return { users: {}, usernameToId: {}, workspaces: {} };
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DatabaseSchema;
    return {
      users: parsed.users ?? {},
      usernameToId: parsed.usernameToId ?? {},
      workspaces: parsed.workspaces ?? {},
    };
  } catch {
    return { users: {}, usernameToId: {}, workspaces: {} };
  }
}

function writeDb(db: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpFile = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(db, null, 2), "utf-8");
  fs.renameSync(tmpFile, DB_FILE);
}

export function hashSecret(secret: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(secret, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifySecret(secret: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 2) return false;
  const [salt, originalHex] = parts;
  const derived = crypto.scryptSync(secret, salt, 64);
  const original = Buffer.from(originalHex, "hex");
  if (derived.length !== original.length) return false;
  return crypto.timingSafeEqual(derived, original);
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid: userId,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
    }),
    "utf-8"
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as { uid?: string; exp?: number };
    if (!parsed.uid || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed.uid;
  } catch {
    return null;
  }
}

export function findUserByUsername(username: string): StoredUserRecord | null {
  const normalized = username.trim().toLowerCase();
  const db = readDb();
  const userId = db.usernameToId[normalized];
  if (!userId) return null;
  return db.users[userId] ?? null;
}

export function findUserById(userId: string): StoredUserRecord | null {
  const db = readDb();
  return db.users[userId] ?? null;
}

export function createUser(
  profile: UserProfile,
  password: string,
  recoveryPhrase: string
): UserProfile {
  const db = readDb();
  const normalized = profile.username.trim().toLowerCase();
  if (db.usernameToId[normalized]) {
    throw new Error("USERNAME_EXISTS");
  }
  db.users[profile.id] = {
    profile,
    passwordHash: hashSecret(password),
    recoveryHash: hashSecret(recoveryPhrase.trim().toLowerCase()),
  };
  db.usernameToId[normalized] = profile.id;
  db.workspaces[profile.id] = defaultWorkspace();
  writeDb(db);
  return profile;
}

export function updateUserProfile(
  userId: string,
  updater: (profile: UserProfile) => UserProfile
): UserProfile | null {
  const db = readDb();
  const record = db.users[userId];
  if (!record) return null;
  record.profile = updater(record.profile);
  writeDb(db);
  return record.profile;
}

export function resetUserPassword(
  username: string,
  recoveryPhrase: string,
  newPassword: string
): boolean {
  const db = readDb();
  const userId = db.usernameToId[username.trim().toLowerCase()];
  if (!userId) return false;
  const record = db.users[userId];
  if (!record) return false;
  if (!verifySecret(recoveryPhrase.trim().toLowerCase(), record.recoveryHash)) {
    return false;
  }
  record.passwordHash = hashSecret(newPassword);
  writeDb(db);
  return true;
}

export function deleteUserAccount(userId: string): boolean {
  const db = readDb();
  const record = db.users[userId];
  if (!record) return false;
  const normalized = record.profile.username.trim().toLowerCase();
  delete db.usernameToId[normalized];
  delete db.users[userId];
  delete db.workspaces[userId];
  writeDb(db);
  return true;
}

export function getUserWorkspace(userId: string): UserWorkspaceData {
  const db = readDb();
  if (!db.workspaces[userId]) {
    db.workspaces[userId] = defaultWorkspace();
    writeDb(db);
  }
  return db.workspaces[userId];
}

export function updateUserWorkspace(
  userId: string,
  updater: (ws: UserWorkspaceData) => UserWorkspaceData
): UserWorkspaceData {
  const db = readDb();
  const current = db.workspaces[userId] ?? defaultWorkspace();
  const updated = updater(current);
  db.workspaces[userId] = updated;
  writeDb(db);
  return updated;
}
