import { Router } from "express";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  getAllUsers,
  getUserByEmail,
  getUserById,
  getUserByUsername,
  updateUserProfile,
} from "../controllers/user.controller";
import protect from "../middlewares/protect.middleware";
import restrictTo from "../middlewares/restrictTo.middleware";

const router = Router();

router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/username/:username", getUserByUsername);
router.get("/user/by-mail", getUserByEmail);
router.patch("/update-user", protect, updateUserProfile);
router.patch(
  "/:username/deactivate",
  protect,
  restrictTo("admin"),
  deactivateUser
);
router.patch("/:username/activate", protect, restrictTo("admin"), activateUser);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);

export default router;
