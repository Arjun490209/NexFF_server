import e from "express";
import auth from "../controllers/auth.controller.js";
import protect from "../middleware/Protect.js";

const router = e.Router();

router.post("/register", auth.register);

router.post("/login", auth.login);

router.get("/users", protect, auth.getAllUsers);

router.put("/user/role/:id", protect, auth.updateUserRole);

router.put("/user/wallet/:id", protect, auth.addWalletBalance);

router.delete("/user/:id", protect, auth.deleteUser);

export default router;
