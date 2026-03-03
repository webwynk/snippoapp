import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./auth.js";
import { INITIAL_BOOKINGS, INITIAL_SERVICES, INITIAL_STAFF } from "./constants.js";
import { normalizeEmail } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const defaultDataFile = path.join(__dirname, "..", "data", "db.json");
const configuredDataFile = String(process.env.DATA_FILE || "").trim();
const dataFile = configuredDataFile ? path.resolve(configuredDataFile) : defaultDataFile;
const dataDir = path.dirname(dataFile);
const isProduction = process.env.NODE_ENV === "production";

let writeQueue = Promise.resolve();

function resolveSeedMode() {
  const raw = String(process.env.SEED_MODE || "").trim().toLowerCase();
  if (raw === "demo" || raw === "secure") {
    return raw;
  }
  return isProduction ? "secure" : "demo";
}

async function buildDemoSeedData() {
  const [adminHash, userHash, staffHash, guestHash] = await Promise.all([
    hashPassword("admin123"),
    hashPassword("password123"),
    hashPassword("staff123"),
    hashPassword("guest123"),
  ]);

  return {
    users: [
      {
        id: "adm",
        name: "Admin",
        email: normalizeEmail("admin@lumaspa.com"),
        passwordHash: adminHash,
        role: "admin",
        status: "active",
        phone: "",
      },
      {
        id: "u1",
        name: "Alex Morgan",
        email: normalizeEmail("alex@example.com"),
        passwordHash: userHash,
        role: "user",
        status: "active",
        phone: "",
      },
      {
        id: "u2",
        name: "Jamie Liu",
        email: normalizeEmail("jamie@example.com"),
        passwordHash: guestHash,
        role: "user",
        status: "active",
        phone: "",
      },
      {
        id: "u3",
        name: "Sam Torres",
        email: normalizeEmail("sam@example.com"),
        passwordHash: guestHash,
        role: "user",
        status: "active",
        phone: "",
      },
      {
        id: "u4",
        name: "Casey Wu",
        email: normalizeEmail("casey@example.com"),
        passwordHash: guestHash,
        role: "user",
        status: "active",
        phone: "",
      },
      {
        id: "stf",
        name: "Marcus Roy",
        email: normalizeEmail("marcus@lumaspa.com"),
        passwordHash: staffHash,
        role: "staff",
        status: "active",
        roleTitle: "Massage Therapist",
        staffId: 2,
        phone: "",
      },
    ],
    services: INITIAL_SERVICES,
    staff: INITIAL_STAFF,
    pendingStaff: [],
    bookings: INITIAL_BOOKINGS,
    counters: {
      user: 5,
      service: 7,
      staff: 5,
      pending: 1,
      booking: 2411,
    },
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}

async function buildSecureSeedData() {
  const adminEmail = normalizeEmail(process.env.ADMIN_BOOTSTRAP_EMAIL || "");
  const adminPassword = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || "");
  const adminName = String(process.env.ADMIN_BOOTSTRAP_NAME || "Admin").trim() || "Admin";

  if (!adminEmail.includes("@")) {
    throw new Error(
      "SEED_MODE=secure requires ADMIN_BOOTSTRAP_EMAIL to be set to a valid email"
    );
  }

  if (adminPassword.length < 10) {
    throw new Error(
      "SEED_MODE=secure requires ADMIN_BOOTSTRAP_PASSWORD with at least 10 characters"
    );
  }

  const adminHash = await hashPassword(adminPassword);

  return {
    users: [
      {
        id: "adm",
        name: adminName,
        email: adminEmail,
        passwordHash: adminHash,
        role: "admin",
        status: "active",
        phone: "",
      },
    ],
    services: INITIAL_SERVICES,
    staff: INITIAL_STAFF,
    pendingStaff: [],
    bookings: [],
    counters: {
      user: 1,
      service: 7,
      staff: 5,
      pending: 1,
      booking: 1,
    },
    meta: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seedMode: "secure",
    },
  };
}

async function buildSeedData() {
  const mode = resolveSeedMode();
  if (mode === "secure") {
    return buildSecureSeedData();
  }
  return buildDemoSeedData();
}

export function getDataFilePath() {
  return dataFile;
}

export async function initStore() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    const seed = await buildSeedData();
    await fs.writeFile(dataFile, JSON.stringify(seed, null, 2), "utf8");
  }
}

export async function readData() {
  await initStore();
  const raw = await fs.readFile(dataFile, "utf8");
  return JSON.parse(raw);
}

export async function updateData(mutator) {
  await initStore();
  let result;

  writeQueue = writeQueue.then(async () => {
    const data = await readData();
    result = await mutator(data);
    data.meta = data.meta || {};
    data.meta.updatedAt = new Date().toISOString();
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
  });

  await writeQueue;
  return result;
}

export function nextCounter(data, key) {
  const current = Number(data.counters?.[key] || 1);
  data.counters = data.counters || {};
  data.counters[key] = current + 1;
  return current;
}
