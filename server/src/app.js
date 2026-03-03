import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import {
  checkPassword,
  getBearerToken,
  hashPassword,
  makeToken,
  sanitizeUser,
  verifyToken,
} from "./auth.js";
import { readData, updateData, nextCounter } from "./store.js";
import {
  formatDateForUi,
  initials,
  normalizeEmail,
  normalizeTimeLabel,
  pickColor,
  toDollarAmount,
} from "./utils.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";

const trustProxy = String(process.env.TRUST_PROXY || (isProduction ? "true" : "false"))
  .trim()
  .toLowerCase();
if (trustProxy === "true" || trustProxy === "1") {
  app.set("trust proxy", 1);
}

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const parsePositiveInt = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

const globalRateLimitWindowMs = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const globalRateLimitMax = parsePositiveInt(
  process.env.RATE_LIMIT_MAX,
  isProduction ? 300 : 2000
);
const authRateLimitMax = parsePositiveInt(
  process.env.AUTH_RATE_LIMIT_MAX,
  isProduction ? 20 : 500
);

const globalLimiter = rateLimit({
  windowMs: globalRateLimitWindowMs,
  max: globalRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: globalRateLimitWindowMs,
  max: authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(globalLimiter);

[
  "/api/auth/register-user",
  "/api/auth/login-user",
  "/api/auth/login-admin",
  "/api/auth/register-staff",
  "/api/auth/login-staff",
].forEach((path) => {
  app.use(path, authLimiter);
});

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function userByEmail(data, email) {
  const normalized = normalizeEmail(email);
  return data.users.find((user) => normalizeEmail(user.email) === normalized);
}

function resolveStaffForUser(data, user) {
  if (!user || user.role !== "staff") {
    return null;
  }

  if (user.staffId !== undefined && user.staffId !== null) {
    return data.staff.find((member) => member.id === user.staffId) || null;
  }

  return (
    data.staff.find((member) => normalizeEmail(member.email) === normalizeEmail(user.email)) || null
  );
}

function resolvePendingForUser(data, user) {
  if (!user || user.role !== "staff") {
    return null;
  }

  if (user.pendingId) {
    return data.pendingStaff.find((pending) => pending.id === user.pendingId) || null;
  }

  return (
    data.pendingStaff.find((pending) => normalizeEmail(pending.email) === normalizeEmail(user.email)) ||
    null
  );
}

async function resolveTokenUser(req) {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    const data = await readData();
    const user = data.users.find((item) => item.id === payload.id);
    return user || null;
  } catch {
    return null;
  }
}

const optionalAuth = asyncHandler(async (req, _res, next) => {
  req.authUser = await resolveTokenUser(req);
  next();
});

function requireAuth(roles = []) {
  return asyncHandler(async (req, _res, next) => {
    const user = await resolveTokenUser(req);
    if (!user) {
      throw httpError(401, "Authentication required");
    }
    if (roles.length > 0 && !roles.includes(user.role)) {
      throw httpError(403, "Forbidden");
    }
    req.authUser = user;
    next();
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get(
  "/api/bootstrap",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const data = await readData();
    const authUser = req.authUser;

    const isAdmin = authUser?.role === "admin";
    const services = isAdmin ? data.services : data.services.filter((service) => service.active);
    const staff = isAdmin ? data.staff : data.staff.filter((member) => member.active);

    let bookings = [];
    let pendingStaff = [];

    if (authUser) {
      if (authUser.role === "admin") {
        bookings = data.bookings;
        pendingStaff = data.pendingStaff;
      } else if (authUser.role === "user") {
        bookings = data.bookings.filter((booking) => booking.userId === authUser.id);
      } else if (authUser.role === "staff") {
        const staffRef = resolveStaffForUser(data, authUser);
        bookings = staffRef
          ? data.bookings.filter((booking) => booking.stf === staffRef.name)
          : [];
      }
    }

    res.json({
      services,
      staff,
      bookings,
      pendingStaff,
    });
  })
);

app.post(
  "/api/auth/register-user",
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const phone = String(req.body?.phone || "").trim();

    if (!name) {
      throw httpError(400, "Name is required");
    }
    if (!email.includes("@")) {
      throw httpError(400, "A valid email is required");
    }
    if (password.length < 6) {
      throw httpError(400, "Password must be at least 6 characters");
    }

    let createdUser;
    await updateData(async (data) => {
      if (userByEmail(data, email)) {
        throw httpError(409, "An account with this email already exists");
      }

      const idNumber = nextCounter(data, "user");
      const user = {
        id: `u${idNumber}`,
        name,
        email,
        phone,
        passwordHash: await hashPassword(password),
        role: "user",
        status: "active",
      };

      data.users.push(user);
      createdUser = user;
      return user;
    });

    const token = makeToken(createdUser);
    res.status(201).json({ token, user: sanitizeUser(createdUser) });
  })
);

app.post(
  "/api/auth/login-user",
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    const data = await readData();
    const user = userByEmail(data, email);
    if (!user || user.role !== "user") {
      throw httpError(401, "Invalid credentials");
    }

    const valid = await checkPassword(password, user.passwordHash);
    if (!valid) {
      throw httpError(401, "Invalid credentials");
    }

    res.json({ token: makeToken(user), user: sanitizeUser(user) });
  })
);

app.post(
  "/api/auth/login-admin",
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    const data = await readData();
    const user = userByEmail(data, email);
    if (!user || user.role !== "admin") {
      throw httpError(401, "Invalid credentials");
    }

    const valid = await checkPassword(password, user.passwordHash);
    if (!valid) {
      throw httpError(401, "Invalid credentials");
    }

    res.json({ token: makeToken(user), user: sanitizeUser(user) });
  })
);

app.post(
  "/api/auth/register-staff",
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");
    const designation = String(req.body?.designation || "").trim();
    const phone = String(req.body?.phone || "").trim();

    if (!name) {
      throw httpError(400, "Name is required");
    }
    if (!designation) {
      throw httpError(400, "Designation is required");
    }
    if (!email.includes("@")) {
      throw httpError(400, "A valid email is required");
    }
    if (password.length < 6) {
      throw httpError(400, "Password must be at least 6 characters");
    }

    let createdUser;
    let pendingEntry;

    await updateData(async (data) => {
      if (userByEmail(data, email)) {
        throw httpError(409, "An account with this email already exists");
      }

      const userId = `stf_${nextCounter(data, "user")}`;
      const pendingId = `ps_${nextCounter(data, "pending")}`;

      pendingEntry = {
        id: pendingId,
        userId,
        name,
        email,
        phone,
        role: designation,
        requestedServices: [],
        appliedAt: new Date().toLocaleString("en-US"),
        i: initials(name),
        c: pickColor(),
        status: "pending",
      };

      createdUser = {
        id: userId,
        name,
        email,
        passwordHash: await hashPassword(password),
        role: "staff",
        status: "pending",
        roleTitle: designation,
        phone,
        pendingId,
      };

      data.pendingStaff.push(pendingEntry);
      data.users.push(createdUser);
      return createdUser;
    });

    res.status(201).json({
      token: makeToken(createdUser),
      user: sanitizeUser(createdUser),
      staffData: pendingEntry,
    });
  })
);

app.post(
  "/api/auth/login-staff",
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "");

    const data = await readData();
    const user = userByEmail(data, email);
    if (!user || user.role !== "staff") {
      throw httpError(401, "Invalid credentials");
    }

    if (user.status === "rejected" || user.status === "disabled") {
      throw httpError(403, "Your staff account is not active");
    }

    const valid = await checkPassword(password, user.passwordHash);
    if (!valid) {
      throw httpError(401, "Invalid credentials");
    }

    const response = {
      token: makeToken(user),
      user: sanitizeUser(user),
    };

    if (user.status === "pending") {
      response.staffData = resolvePendingForUser(data, user);
    } else {
      response.staffRef = resolveStaffForUser(data, user);
    }

    res.json(response);
  })
);

app.get(
  "/api/auth/me",
  requireAuth(),
  asyncHandler(async (req, res) => {
    const data = await readData();
    const user = data.users.find((item) => item.id === req.authUser.id);
    if (!user) {
      throw httpError(401, "Session invalid");
    }

    if (user.role === "staff" && (user.status === "rejected" || user.status === "disabled")) {
      throw httpError(403, "Staff account inactive");
    }

    const payload = { user: sanitizeUser(user) };
    if (user.role === "staff") {
      if (user.status === "pending") {
        payload.staffData = resolvePendingForUser(data, user);
      } else {
        payload.staffRef = resolveStaffForUser(data, user);
      }
    }

    res.json(payload);
  })
);

app.get(
  "/api/bookings",
  requireAuth(),
  asyncHandler(async (req, res) => {
    const data = await readData();
    const user = data.users.find((item) => item.id === req.authUser.id);

    if (!user) {
      throw httpError(401, "Session invalid");
    }

    if (user.role === "admin") {
      res.json(data.bookings);
      return;
    }

    if (user.role === "user") {
      res.json(data.bookings.filter((booking) => booking.userId === user.id));
      return;
    }

    const staffRef = resolveStaffForUser(data, user);
    if (!staffRef) {
      res.json([]);
      return;
    }
    res.json(data.bookings.filter((booking) => booking.stf === staffRef.name));
  })
);

app.post(
  "/api/bookings",
  requireAuth(["user"]),
  asyncHandler(async (req, res) => {
    const { serviceId, staffId, date, time, details } = req.body || {};

    let createdBooking;
    await updateData(async (data) => {
      const user = data.users.find((item) => item.id === req.authUser.id);
      if (!user) {
        throw httpError(401, "Session invalid");
      }

      const service = data.services.find((item) => item.id === Number(serviceId) && item.active);
      if (!service) {
        throw httpError(400, "Selected service is unavailable");
      }

      const staffMember = data.staff.find((item) => item.id === Number(staffId) && item.active);
      if (!staffMember) {
        throw httpError(400, "Selected staff member is unavailable");
      }

      if (!staffMember.services.includes(Number(service.id))) {
        throw httpError(400, "Selected staff member is not assigned to this service");
      }

      const dateLabel = formatDateForUi(date);
      const timeLabel = normalizeTimeLabel(time);
      if (!dateLabel || !timeLabel) {
        throw httpError(400, "Invalid date or time");
      }

      const hasConflict = data.bookings.some(
        (booking) =>
          booking.stf === staffMember.name &&
          booking.dt === dateLabel &&
          booking.t === timeLabel &&
          ["upcoming", "active"].includes(booking.s)
      );

      if (hasConflict) {
        throw httpError(409, "Selected slot is already booked");
      }

      const bookingId = `BK-${nextCounter(data, "booking")}`;
      const customerName = String(details?.name || user.name || "").trim() || user.name;

      createdBooking = {
        id: bookingId,
        userId: user.id,
        svc: service.name,
        stf: staffMember.name,
        dt: dateLabel,
        t: timeLabel,
        p: toDollarAmount(service.price),
        s: "upcoming",
        paid: true,
        u: customerName,
        serviceId: service.id,
        staffId: staffMember.id,
        notes: String(details?.notes || "").trim(),
        createdAt: new Date().toISOString(),
      };

      data.bookings.push(createdBooking);
      return createdBooking;
    });

    res.status(201).json(createdBooking);
  })
);

app.put(
  "/api/users/me",
  requireAuth(["user"]),
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email);
    const phone = String(req.body?.phone || "").trim();

    if (!name) {
      throw httpError(400, "Name is required");
    }
    if (!email.includes("@")) {
      throw httpError(400, "A valid email is required");
    }

    let updated;
    await updateData(async (data) => {
      const user = data.users.find((item) => item.id === req.authUser.id);
      if (!user || user.role !== "user") {
        throw httpError(401, "Session invalid");
      }

      const duplicate = data.users.find(
        (item) => item.id !== user.id && normalizeEmail(item.email) === email
      );
      if (duplicate) {
        throw httpError(409, "Email already in use");
      }

      const oldName = user.name;
      user.name = name;
      user.email = email;
      user.phone = phone;

      data.bookings.forEach((booking) => {
        if (booking.userId === user.id && booking.u === oldName) {
          booking.u = name;
        }
      });

      updated = sanitizeUser(user);
      return updated;
    });

    res.json({ user: updated });
  })
);

app.get(
  "/api/admin/data",
  requireAuth(["admin"]),
  asyncHandler(async (_req, res) => {
    const data = await readData();
    res.json({
      services: data.services,
      staff: data.staff,
      bookings: data.bookings,
      pendingStaff: data.pendingStaff,
    });
  })
);

app.post(
  "/api/admin/services",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const desc = String(req.body?.desc || "").trim();
    const price = Number(req.body?.price || 0);
    const dur = String(req.body?.dur || "60");
    const img = String(req.body?.img || "").trim();
    const active = Boolean(req.body?.active ?? true);

    if (!name) {
      throw httpError(400, "Service name is required");
    }
    if (!Number.isFinite(price) || price <= 0) {
      throw httpError(400, "Service price must be greater than zero");
    }

    let createdService;
    await updateData(async (data) => {
      createdService = {
        id: nextCounter(data, "service"),
        name,
        desc,
        price,
        dur,
        img,
        active,
      };
      data.services.push(createdService);
      return createdService;
    });

    res.status(201).json(createdService);
  })
);

app.put(
  "/api/admin/services/:id",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const name = String(req.body?.name || "").trim();
    const desc = String(req.body?.desc || "").trim();
    const price = Number(req.body?.price || 0);
    const dur = String(req.body?.dur || "60");
    const img = String(req.body?.img || "").trim();
    const active = Boolean(req.body?.active ?? true);

    if (!name) {
      throw httpError(400, "Service name is required");
    }
    if (!Number.isFinite(price) || price <= 0) {
      throw httpError(400, "Service price must be greater than zero");
    }

    let updatedService;
    await updateData(async (data) => {
      const service = data.services.find((item) => item.id === id);
      if (!service) {
        throw httpError(404, "Service not found");
      }

      service.name = name;
      service.desc = desc;
      service.price = price;
      service.dur = dur;
      service.img = img;
      service.active = active;
      updatedService = service;
      return updatedService;
    });

    res.json(updatedService);
  })
);

app.delete(
  "/api/admin/services/:id",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await updateData(async (data) => {
      const exists = data.services.some((item) => item.id === id);
      if (!exists) {
        throw httpError(404, "Service not found");
      }

      data.services = data.services.filter((item) => item.id !== id);
      data.staff = data.staff.map((member) => ({
        ...member,
        services: (member.services || []).filter((serviceId) => serviceId !== id),
      }));
      return true;
    });

    res.status(204).end();
  })
);

app.post(
  "/api/admin/staff",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const role = String(req.body?.role || "").trim();
    const email = normalizeEmail(req.body?.email);
    const color = String(req.body?.c || pickColor());
    const services = Array.isArray(req.body?.services)
      ? req.body.services.map(Number).filter(Number.isFinite)
      : [];
    const avail = Array.isArray(req.body?.avail) && req.body.avail.length === 7
      ? req.body.avail.map(Boolean)
      : [true, true, true, true, true, false, false];

    if (!name) {
      throw httpError(400, "Name is required");
    }
    if (!role) {
      throw httpError(400, "Role is required");
    }
    if (!email.includes("@")) {
      throw httpError(400, "A valid email is required");
    }

    let createdStaff;
    await updateData(async (data) => {
      const duplicate = data.staff.find(
        (member) => normalizeEmail(member.email) === normalizeEmail(email)
      );
      if (duplicate) {
        throw httpError(409, "A staff member with this email already exists");
      }

      createdStaff = {
        id: nextCounter(data, "staff"),
        name,
        role,
        email,
        i: initials(name),
        c: color,
        services,
        avail,
        active: true,
      };
      data.staff.push(createdStaff);

      const linkedUser = userByEmail(data, email);
      if (linkedUser && linkedUser.role === "staff") {
        linkedUser.status = "active";
        linkedUser.staffId = createdStaff.id;
        linkedUser.name = createdStaff.name;
        linkedUser.roleTitle = createdStaff.role;
      }

      return createdStaff;
    });

    res.status(201).json(createdStaff);
  })
);

app.put(
  "/api/admin/staff/:id",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const name = String(req.body?.name || "").trim();
    const role = String(req.body?.role || "").trim();
    const email = normalizeEmail(req.body?.email);
    const color = String(req.body?.c || pickColor());
    const services = Array.isArray(req.body?.services)
      ? req.body.services.map(Number).filter(Number.isFinite)
      : [];
    const avail = Array.isArray(req.body?.avail) && req.body.avail.length === 7
      ? req.body.avail.map(Boolean)
      : [true, true, true, true, true, false, false];
    const active = Boolean(req.body?.active ?? true);

    if (!name) {
      throw httpError(400, "Name is required");
    }
    if (!role) {
      throw httpError(400, "Role is required");
    }
    if (!email.includes("@")) {
      throw httpError(400, "A valid email is required");
    }

    let updatedStaff;
    await updateData(async (data) => {
      const staffMember = data.staff.find((item) => item.id === id);
      if (!staffMember) {
        throw httpError(404, "Staff member not found");
      }

      const duplicateStaff = data.staff.find(
        (item) => item.id !== id && normalizeEmail(item.email) === email
      );
      if (duplicateStaff) {
        throw httpError(409, "Another staff member already uses this email");
      }

      const duplicateUser = data.users.find(
        (item) => item.id !== req.authUser.id && normalizeEmail(item.email) === email
      );
      if (duplicateUser && duplicateUser.role !== "staff") {
        throw httpError(409, "Email already belongs to another account");
      }

      const oldName = staffMember.name;
      const oldEmail = staffMember.email;

      staffMember.name = name;
      staffMember.role = role;
      staffMember.email = email;
      staffMember.c = color;
      staffMember.i = initials(name);
      staffMember.services = services;
      staffMember.avail = avail;
      staffMember.active = active;
      updatedStaff = staffMember;

      if (oldName !== name) {
        data.bookings.forEach((booking) => {
          if (booking.stf === oldName) {
            booking.stf = name;
          }
        });
      }

      const linkedUser = data.users.find(
        (item) =>
          item.role === "staff" &&
          (item.staffId === id || normalizeEmail(item.email) === normalizeEmail(oldEmail))
      );
      if (linkedUser) {
        linkedUser.name = name;
        linkedUser.email = email;
        linkedUser.roleTitle = role;
        linkedUser.status = active ? "active" : "disabled";
        linkedUser.staffId = active ? id : null;
      }

      return updatedStaff;
    });

    res.json(updatedStaff);
  })
);

app.delete(
  "/api/admin/staff/:id",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await updateData(async (data) => {
      const staffMember = data.staff.find((item) => item.id === id);
      if (!staffMember) {
        throw httpError(404, "Staff member not found");
      }

      data.staff = data.staff.filter((item) => item.id !== id);
      data.users = data.users.map((user) => {
        if (user.role === "staff" && user.staffId === id) {
          return { ...user, status: "disabled", staffId: null };
        }
        return user;
      });
      return true;
    });

    res.status(204).end();
  })
);

app.patch(
  "/api/admin/bookings/:id/status",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);
    const status = String(req.body?.status || "");
    const allowed = ["upcoming", "active", "completed", "cancelled"];

    if (!allowed.includes(status)) {
      throw httpError(400, "Invalid booking status");
    }

    let updated;
    await updateData(async (data) => {
      const booking = data.bookings.find((item) => item.id === id);
      if (!booking) {
        throw httpError(404, "Booking not found");
      }
      booking.s = status;
      updated = booking;
      return updated;
    });

    res.json(updated);
  })
);

app.post(
  "/api/admin/pending/:id/approve",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);

    let approvedMember;
    let pendingStaff;
    await updateData(async (data) => {
      const pending = data.pendingStaff.find((item) => item.id === id);
      if (!pending) {
        throw httpError(404, "Pending request not found");
      }

      approvedMember = {
        id: nextCounter(data, "staff"),
        name: pending.name,
        role: pending.role || "Specialist",
        email: pending.email,
        i: pending.i || initials(pending.name),
        c: pending.c || pickColor(),
        services: pending.requestedServices || [],
        avail: [true, true, true, true, true, false, false],
        active: true,
      };

      data.staff.push(approvedMember);
      data.pendingStaff = data.pendingStaff.filter((item) => item.id !== id);
      pendingStaff = data.pendingStaff;

      const user = data.users.find(
        (item) =>
          item.role === "staff" &&
          (item.id === pending.userId || normalizeEmail(item.email) === normalizeEmail(pending.email))
      );
      if (user) {
        user.name = approvedMember.name;
        user.email = approvedMember.email;
        user.roleTitle = approvedMember.role;
        user.status = "active";
        user.staffId = approvedMember.id;
        user.pendingId = null;
      }

      return approvedMember;
    });

    res.json({ staffMember: approvedMember, pendingStaff });
  })
);

app.post(
  "/api/admin/pending/:id/reject",
  requireAuth(["admin"]),
  asyncHandler(async (req, res) => {
    const id = String(req.params.id);

    let pendingStaff;
    await updateData(async (data) => {
      const pending = data.pendingStaff.find((item) => item.id === id);
      if (!pending) {
        throw httpError(404, "Pending request not found");
      }

      data.pendingStaff = data.pendingStaff.filter((item) => item.id !== id);
      pendingStaff = data.pendingStaff;

      const user = data.users.find(
        (item) =>
          item.role === "staff" &&
          (item.id === pending.userId || normalizeEmail(item.email) === normalizeEmail(pending.email))
      );
      if (user) {
        user.status = "rejected";
        user.pendingId = null;
      }

      return true;
    });

    res.json({ pendingStaff });
  })
);

app.get(
  "/api/staff/bookings",
  requireAuth(["staff"]),
  asyncHandler(async (req, res) => {
    const data = await readData();
    const user = data.users.find((item) => item.id === req.authUser.id);
    if (!user) {
      throw httpError(401, "Session invalid");
    }

    if (user.status !== "active") {
      res.json([]);
      return;
    }

    const staffRef = resolveStaffForUser(data, user);
    if (!staffRef) {
      res.json([]);
      return;
    }

    res.json(data.bookings.filter((booking) => booking.stf === staffRef.name));
  })
);

app.put(
  "/api/staff/me/services",
  requireAuth(["staff"]),
  asyncHandler(async (req, res) => {
    const selected = Array.isArray(req.body?.services)
      ? [...new Set(req.body.services.map(Number).filter(Number.isFinite))]
      : null;

    if (!selected) {
      throw httpError(400, "Services array is required");
    }

    let updated;
    await updateData(async (data) => {
      const user = data.users.find((item) => item.id === req.authUser.id);
      if (!user || user.status !== "active") {
        throw httpError(403, "Staff account is not active");
      }

      const staffRef = resolveStaffForUser(data, user);
      if (!staffRef) {
        throw httpError(404, "Staff profile not found");
      }

      staffRef.services = selected;
      updated = staffRef;
      return updated;
    });

    res.json(updated);
  })
);

app.put(
  "/api/staff/me/availability",
  requireAuth(["staff"]),
  asyncHandler(async (req, res) => {
    const avail = Array.isArray(req.body?.avail) ? req.body.avail.map(Boolean) : null;
    if (!avail || avail.length !== 7) {
      throw httpError(400, "Availability must be an array of 7 booleans");
    }

    let updated;
    await updateData(async (data) => {
      const user = data.users.find((item) => item.id === req.authUser.id);
      if (!user || user.status !== "active") {
        throw httpError(403, "Staff account is not active");
      }

      const staffRef = resolveStaffForUser(data, user);
      if (!staffRef) {
        throw httpError(404, "Staff profile not found");
      }

      staffRef.avail = avail;
      updated = staffRef;
      return updated;
    });

    res.json(updated);
  })
);

app.put(
  "/api/staff/me/profile",
  requireAuth(["staff"]),
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || "").trim();
    const role = String(req.body?.role || "").trim();
    const email = normalizeEmail(req.body?.email);

    if (!name) {
      throw httpError(400, "Name is required");
    }
    if (!role) {
      throw httpError(400, "Role is required");
    }
    if (!email.includes("@")) {
      throw httpError(400, "A valid email is required");
    }

    let updated;
    await updateData(async (data) => {
      const user = data.users.find((item) => item.id === req.authUser.id);
      if (!user || user.status !== "active") {
        throw httpError(403, "Staff account is not active");
      }

      const staffRef = resolveStaffForUser(data, user);
      if (!staffRef) {
        throw httpError(404, "Staff profile not found");
      }

      const duplicateStaff = data.staff.find(
        (item) => item.id !== staffRef.id && normalizeEmail(item.email) === email
      );
      if (duplicateStaff) {
        throw httpError(409, "Another staff profile already uses this email");
      }

      const duplicateUser = data.users.find(
        (item) => item.id !== user.id && normalizeEmail(item.email) === email
      );
      if (duplicateUser && duplicateUser.role !== "staff") {
        throw httpError(409, "Email already belongs to another account");
      }

      const oldName = staffRef.name;
      staffRef.name = name;
      staffRef.role = role;
      staffRef.email = email;
      staffRef.i = initials(name);

      user.name = name;
      user.email = email;
      user.roleTitle = role;

      if (oldName !== name) {
        data.bookings.forEach((booking) => {
          if (booking.stf === oldName) {
            booking.stf = name;
          }
        });
      }

      updated = staffRef;
      return updated;
    });

    res.json(updated);
  })
);

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = status >= 500 ? "Internal server error" : err.message;
  res.status(status).json({ error: message });
});

export default app;
