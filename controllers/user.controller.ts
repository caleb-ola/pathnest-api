import BadRequestError from "../errors/badRequest.error";
import NotAuthorizedError from "../errors/notAuthorized.error";
import { CustomRequest } from "../middlewares/middleware.types";
import Child from "../models/child.model";
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

export const getUserById = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findById(id).populate("children");
  if (!user) throw new BadRequestError("User not found");

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

export const getUserByUsername = AsyncHandler(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) throw new BadRequestError("User not found");

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

export const getUserByEmail = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new BadRequestError("User not found");

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

export const updateUserProfile = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { currentUser } = req;
    if (!currentUser)
      throw new NotAuthorizedError("Not authorized to perform this action");

    const { name, username, gender, bio } = req.body;

    const user = await User.findById(currentUser.id);
    if (!user) throw new BadRequestError("User not found");

    if (name) user.name = name;
    if (username) user.username = username;
    if (gender) user.gender = gender;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        data: user,
      },
    });
  }
);

export const deactivateUser = AsyncHandler(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("+active");
  if (!user) throw new BadRequestError("User not found");

  user.active = false;
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

export const activateUser = AsyncHandler(async (req, res, next) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("+active");
  if (!user) throw new BadRequestError("User not found");

  user.active = true;
  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

export const deleteUser = AsyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) throw new BadRequestError("User not found");

  res.status(204).json({
    status: "success",
  });
});
