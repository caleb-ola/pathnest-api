import { Response } from "express";
import config from "../config";
import BadRequestError from "../errors/badRequest.error";
import User from "../models/user.model";
import EmailService from "../services/Email.service";
import AsyncHandler from "../utils/asyncHandler";
import { createRandomUsername } from "../utils/casuals";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { CustomRequest } from "../middlewares/middleware.types";

const generateToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES,
  });
};

const createSendToken = async (
  user: any,
  statusCode: number,
  res: Response
) => {
  const token = generateToken(user.id, user.email);

  user.lastLogin = new Date(Date.now()).toISOString();
  await user.save();

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      data: user,
    },
  });
};

// Signup a user and send verification link to their email
export const signup = AsyncHandler(async (req, res, next) => {
  // Collect user inputs
  const { name, email, password, confirmPassword } = req.body;

  // Check passwords matching
  if (password !== confirmPassword)
    throw new BadRequestError(
      "Passwords do not match, please check and try again"
    );

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new BadRequestError(
      "User email already exists, please try another email"
    );

  // Create new user instance
  const newUser = new User({
    name,
    email,
    password,
    username: createRandomUsername(name),
  });

  // Send Verifiaction Token to New User
  const token = newUser.createVerificationToken();

  const url = `${config.APP_CLIENT}/auth/email-verification/${token}`;

  await new EmailService(newUser, url).sendEmailVerification();

  await newUser.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: {
      message: "We sent a verification to your email address",
    },
  });
});

// Login User
export const login = AsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) throw new BadRequestError("Email is required!");
  if (!password) throw new BadRequestError("Password is required!");

  // Check if user with email exists
  const existingUser = await User.findOne({ email }).select(
    "+password +active +isVerified"
  );
  if (!existingUser) throw new BadRequestError("Email or password incorrect.");

  // Check if user is verified
  if (!existingUser.isVerified) {
    throw new BadRequestError(
      "We sent you a verification email, please verify your email or proceed to resend verification."
    );
  }

  // Check if user account is active
  if (!existingUser.active)
    throw new BadRequestError(
      "Your account has been deactivated, please contact support."
    );

  // Check if user passwords are the same
  const correctPassword = existingUser.checkPassword(
    password,
    existingUser.password
  );
  if (!correctPassword)
    throw new BadRequestError("Email or password incorrect.");

  createSendToken(existingUser, 200, res);
});

// Verify user email and login the user
export const emailVerification = AsyncHandler(async (req, res, next) => {
  const { token } = req.body;
  if (!token) throw new BadRequestError("Token is required");

  const verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    verificationToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) throw new BadRequestError("Invalid token, token may have expired");

  if (user.isVerified)
    throw new BadRequestError("User already verified, please proceed to login");

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  await user.save();

  new EmailService(user, "").sendWelcome();

  createSendToken(user, 200, res);
});

// Resend email verification to user
export const resendEmailVerification = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Email is reqiuired");

  const existingUser = await User.findOne({ email });
  if (!existingUser)
    throw new BadRequestError(
      "User email not found, please proceed to signup."
    );

  const token = existingUser.createVerificationToken();

  const url = `${config.APP_CLIENT}/auth/email-verification/${token}`;

  await existingUser.save();

  await new EmailService(existingUser, url).sendEmailVerification();

  res.status(200).json({
    status: "success",
    data: {
      message: "We sent a verification to your email address",
    },
  });
});

// Send password reset link to the user's email
export const forgotPassword = AsyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) throw new BadRequestError("Email is required!");

  const existingUser = await User.findOne({ email });
  if (!existingUser)
    throw new BadRequestError(
      "User email not found, please proceed to signup."
    );

  const token = existingUser.createPasswordResetToken();

  const url = `${config.APP_CLIENT}/auth/reset-password/${token}`;

  await existingUser.save();

  res.status(200).json({
    status: "success",
    data: {
      message: "We sent a password reset link to your email.",
    },
  });
});

// Reset password with password reset token
export const resetPassword = AsyncHandler(async (req, res, next) => {
  const { password, confirmPassword, token } = req.body;

  if (!password) throw new BadRequestError("Password is required!");
  if (!confirmPassword)
    throw new BadRequestError("Confirm password is required!");
  if (!token) throw new BadRequestError("Token is required");

  if (password !== confirmPassword)
    throw new BadRequestError(
      "Passwords must be the same, please confirm and try again."
    );

  const verifiedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: verifiedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user)
    throw new BadRequestError("Invalid token, token may have expired.");

  user.password = password;
  user.passwordChangedAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
    data: {
      message: "Password reset successful",
    },
  });
});

// Update password
export const updatePassword = AsyncHandler(
  async (req: CustomRequest, res, next) => {
    const { email } = req.currentUser;
    const { password, newPassword, confirmNewPassword } = req.body;

    if (!password) throw new BadRequestError("Password is required.");
    if (!newPassword) throw new BadRequestError("New password is required");
    if (!confirmNewPassword)
      throw new BadRequestError("Confirm new password is required");

    if (newPassword !== confirmNewPassword)
      throw new BadRequestError("Passwords must be the same.");

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new BadRequestError("Invalid token, please login again");

    // Check if old password is correct
    const passwordCheck = user.checkPassword(password, user.password);
    if (!passwordCheck)
      throw new BadRequestError("Password is incorrect, please try again.");

    user.password = newPassword;
    user.passwordChangedAt = Date.now();

    await user.save();

    createSendToken(user, 200, res);
  }
);

// Test emails
export const sendTestEmail = AsyncHandler(async (req, res, next) => {
  const user = {
    name: "Jane Doe",
    username: "jane_doeaf20df78e760",
    email: "dolabomitest@gmail.com",
    slug: "jane-doe",
    role: "user",
  };

  new EmailService(user, "").sendWelcome();
  //   new EmailService(user, "").sendEmailVerification();
  //   new EmailService(user, "").sendForgotPassword();
  //   new EmailService(user, "").sendPasswordChanged();
  //   new EmailService(user, "").sendPartnerAddition();
  //   new EmailService(user, "").sendPartnerInvitation();

  res.status(200).json({
    status: "success",
    data: {
      data: "A test email has been sent.",
    },
  });
});
