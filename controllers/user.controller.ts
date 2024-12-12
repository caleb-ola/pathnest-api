import BadRequestError from "../errors/badRequest.error";
import User from "../models/user.model";
import APIFeatures from "../utils/apiFeatures";
import AsyncHandler from "../utils/asyncHandler";

export const getAllUsers = AsyncHandler(async (req, res, next) => {
  const features = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();

  const userQuery = await features.query;

  res.status(200).json({
    status: "success",
    results: userQuery.length,
    data: {
      data: userQuery,
    },
  });
});

export const getSingleUser = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new BadRequestError("User not found");

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});
