import e from "express";
import auth from "../controllers/auth.controller.js";
import protect from "../middleware/Protect.js";
import adminOnly from "../middleware/admin.js";

const router = e.Router();

router.post("/register", auth.register);

router.post("/login", auth.login);

router.get("/users", protect, adminOnly, auth.getAllUsers);

router.put("/user/role/:id", protect, adminOnly, auth.updateUserRole);

router.put("/user/wallet/:id", protect, adminOnly, auth.addWalletBalance);

router.delete("/user/:id", protect, adminOnly, auth.deleteUser);

export default router;
