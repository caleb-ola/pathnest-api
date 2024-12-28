import BadRequestError from "../errors/badRequest.error";
import NotAuthorizedError from "../errors/notAuthorized.error";
import { CustomRequest } from "../middlewares/middleware.types";
import Child from "../models/child.model";
import AsyncHandler from "../utils/asyncHandler";

export const createChildRecommendation = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { currentUser } = req;
    const { id } = req.params;

    const { recommendation, inputs, recommendationDesc } = req.body;
    if (!recommendation)
      throw new BadRequestError("Recommendation is required");
    if (!inputs) throw new BadRequestError("Inputs is required");
    if (!recommendationDesc)
      throw new BadRequestError("Description is required");

    if (inputs.length !== 10)
      throw new BadRequestError("There must be 10 inputs");

    const newRecommendation = {
      recommendation,
      inputs,
      recommendationDesc,
    };

    const child = await Child.findOne({ _id: id, parent: currentUser.id });
    if (!child)
      throw new NotAuthorizedError(
        "You are not allowed to perform this action"
      );

    child.recommendationHistory.push(newRecommendation);
    await child.save();

    res.status(200).json({
      status: "success",
      data: {
        data: child,
      },
    });
  }
);

export const deleteRecommendation = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { childId, recommendId } = req.params;
    const { currentUser } = req;

    const child = await Child.findOneAndUpdate(
      { _id: childId, parent: currentUser.id },
      { $pull: { recommendationHistory: { _id: recommendId } } },
      { new: true }
    );
    if (!child)
      throw new NotAuthorizedError(
        "You are not allowed to perform this action."
      );

    res.status(201).json({
      status: "success",
    });
  }
);

export const deleteAllRecommendations = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { id } = req.params;
    const { currentUser } = req;

    const child = await Child.findOneAndUpdate(
      { _id: id, parent: currentUser.id },
      { $set: { recommendationHistory: [] } },
      { new: true }
    );

    if (!child)
      throw new NotAuthorizedError(
        "You are not authorized to perform this task"
      );

    res.status(201).json({
      status: "success",
    });
  }
);
