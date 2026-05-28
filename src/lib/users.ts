import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const DB_PATH = process.env.USERS_DB_PATH ?? "./data/users.db";

let dbInstance: Database.Database | null = null;
function db(): Database.Database {
  if (!dbInstance) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    dbInstance = new Database(DB_PATH);
    dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }
  return dbInstance;
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<{ email: string } | null> {
  const row = db()
    .prepare("SELECT email, password_hash FROM users WHERE email = ?")
    .get(email.toLowerCase()) as
    | { email: string; password_hash: string }
    | undefined;
  if (!row) return null;
  const valid = await bcrypt.compare(password, row.password_hash);
  return valid ? { email: row.email } : null;
}

export async function addUser(email: string, password: string): Promise<void> {
  const hash = await bcrypt.hash(password, 12);
  db()
    .prepare(
      "INSERT OR REPLACE INTO users (email, password_hash, created_at) VALUES (?, ?, ?)",
    )
    .run(email.toLowerCase(), hash, Math.floor(Date.now() / 1000));
}
