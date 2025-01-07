import { Router } from "express";
import {
  acceptPartnerRequest,
  createChild,
  createPartnerRequest,
  deleteChild,
  getAllChildren,
  getChild,
  getChildAsPartner,
  getChildrenAsPartner,
  rejectPartnerRequest,
  removePartnerFromChild,
  resendPartnerRequest,
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

// PARTNER ROUTES
router.post("/:id/partners/add-partner", protect, createPartnerRequest);
router.post(
  "/:childId/partners/:requestId/accept",
  protect,
  acceptPartnerRequest
);
router.post(
  "/:childId/partners/:requestId/reject",
  protect,
  rejectPartnerRequest
);
router.delete(
  "/:childId/partners/:partnerId/remove",
  protect,
  removePartnerFromChild
);
router.post("/:id/partners/resend-partner", protect, resendPartnerRequest);

router.get("/:childId/partners/partner-child", protect, getChildAsPartner);
router.get("/partners/partner-children", protect, getChildrenAsPartner);

export default router;
