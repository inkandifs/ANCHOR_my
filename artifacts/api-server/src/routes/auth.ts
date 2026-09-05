import { Router, type IRouter } from "express";
import { memoryStore, saveStore } from "../lib/store";

const router: IRouter = Router();

router.post("/auth/login", (req, res) => {
  const { loginId } = req.body;
  const user = memoryStore.users.find((u: any) => u.loginId === loginId || u.email === loginId);
  if (user) {
    return res.json({ success: true, user });
  }
  return res.json({ 
    success: true, 
    user: { id: 1, loginId: loginId || "mara.chen", name: "Mara Chen", email: "mara@hearthandform.co", role: "User", companyName: "Hearth & Form Studio" } 
  });
});

router.post("/auth/signup", (req, res) => {
  const { name, loginId, email, role, companyName, billingAddress } = req.body;
  const newUser = {
    id: memoryStore.users.length + 1,
    name: name || "New Member",
    loginId: loginId || `user_${Date.now()}`,
    email: email || "user@example.com",
    role: role || "User",
    companyName: companyName || "New Company",
    billingAddress: billingAddress || ""
  };
  memoryStore.users.push(newUser);
  saveStore();
  return res.status(201).json({ success: true, user: newUser });
});

router.get("/auth/me", (_req, res) => {
  res.json({ success: true, user: memoryStore.users[0] });
});

export default router;
