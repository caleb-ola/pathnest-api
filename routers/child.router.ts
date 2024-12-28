import { Router } from "express";
import {
  createChild,
  createPartnerRequest,
  deleteChild,
  getAllChildren,
  getChild,
  updateChild,
} from "../controllers/child.controller";
import protect from "../middlewares/protect.middleware";
import {
  createChildRecommendation,
  deleteAllRecommendations,
  deleteRecommendation,
} from "../controllers/recommendation.controller";

const router = Router();

router.post("/", protect, createChild);
router.get("/", protect, getAllChildren);
router.get("/:id", protect, getChild);
router.patch("/:id", protect, updateChild);
router.delete("/:id", protect, deleteChild);
router.post("/:id/add-recommendation", protect, createChildRecommendation);
router.delete(
  "/:childId/delete-recommendation/:recommendId",
  protect,
  deleteRecommendation
);
router.delete(
  "/:id/delete-all-recommendations",
  protect,
  deleteAllRecommendations
);
router.post("/:id/add-partner", protect, createPartnerRequest);

export default router;
