import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";

const router: IRouter = Router();

function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

router.post("/auth/login", async (req, res) => {
  try {
    const { loginId, password } = req.body;
    if (!loginId || !password) {
      return res.status(400).json({ success: false, message: "Login ID and password are required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.loginId, loginId), eq(usersTable.email, loginId)));

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid login ID or password" });
    }

    const match = bcrypt.compareSync(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid login ID or password" });
    }

    res.cookie("session_user_id", String(user.id), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax"
    });

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err: any) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
});

router.post("/auth/signup", async (req, res) => {
  try {
    const { name, loginId, email, password, role, companyName, billingAddress } = req.body;
    if (!name || !loginId || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, Login ID, Email, and Password are required" });
    }

    const existingLogin = await db.select().from(usersTable).where(eq(usersTable.loginId, loginId));
    if (existingLogin.length > 0) {
      return res.status(409).json({ success: false, message: "Login ID is already taken" });
    }

    const existingEmail = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existingEmail.length > 0) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const [newUser] = await db
      .insert(usersTable)
      .values({
        name,
        loginId,
        email,
        passwordHash,
        role: role || "User",
        companyName: companyName || "New Company",
        billingAddress: billingAddress || ""
      })
      .returning();

    res.cookie("session_user_id", String(newUser.id), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "lax"
    });

    return res.status(201).json({ success: true, user: sanitizeUser(newUser) });
  } catch (err: any) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const userId = req.cookies?.session_user_id;
    if (!userId) {
      return res.status(401).json({ success: false, user: null, message: "Unauthenticated" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, Number(userId)));
    if (!user) {
      return res.status(401).json({ success: false, user: null, message: "User not found" });
    }

    return res.json({ success: true, user: sanitizeUser(user) });
  } catch (err: any) {
    return res.status(500).json({ success: false, user: null, message: "Server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie("session_user_id");
  return res.json({ success: true, message: "Logged out" });
});

export default router;
