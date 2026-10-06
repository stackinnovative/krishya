import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetPath = path.resolve(__dirname, "../../.env");

const generateSecret = () => crypto.randomBytes(32).toString("hex");

const envContent = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, "utf8") : "";
const lines = envContent.split(/\r?\n/);

const ensureEnvValue = (key: string, value: string) => {
  const existingIndex = lines.findIndex((line) => line.startsWith(`${key}=`));

  if (existingIndex >= 0) {
    lines[existingIndex] = `${key}=${value}`;
    return;
  }

  lines.push(`${key}=${value}`);
};

ensureEnvValue("JWT_ACCESS_SECRET", generateSecret());
ensureEnvValue("JWT_REFRESH_SECRET", generateSecret());

const updatedContent = lines.join("\n").replace(/\n{3,}/g, "\n\n");
fs.writeFileSync(targetPath, updatedContent.endsWith("\n") ? updatedContent : `${updatedContent}\n`);

console.log("✅ JWT secrets written to .env");
