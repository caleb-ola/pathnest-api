import mongoose, { Query, Schema } from "mongoose";
import slugify from "slugify";
import validator from "validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface UserTypes extends mongoose.Document {
  name: string;
  username: string;
  email: string;
  gender: string;
  bio: string;
  avatar: string;
  bannerImage: string;
  slug: string;
  role: string;
  partners: Array<{ type: Schema.Types.ObjectId; ref: "user" }>;
  children: Array<{ type: Schema.Types.ObjectId; ref: "child" }>;
  lastLogin: string;
  password: string;
  passwordChangedAt: string | number;
  passwordResetToken: string | undefined;
  passwordResetExpires: string | undefined;
  active: boolean;
  isVerified: boolean;
  verificationToken: string | undefined;
  verificationTokenExpires: string | undefined;
  createVerificationToken(): string;
  checkPassword(inputPassword: string, userPassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  changedPasswordAfter(JWTTimestamp: number): boolean;
}

const userSchema = new mongoose.Schema<UserTypes>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      max: [60, "Name cannot be more than 60 characters"],
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      max: [60, "Username cannot be more than 60 characters"],
      lower: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lower: true,
      unique: true,
      validate: [validator.isEmail, "Input must be an email"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    bio: {
      type: String,
      max: [250, "Bio cannot be more than 25 characters"],
    },
    avatar: String,
    bannerImage: String,
    slug: String,
    role: {
      type: String,
      enum: ["user", "admin"],
    },
    partners: [{ type: Schema.Types.ObjectId, ref: "User" }],
    children: [{ type: Schema.Types.ObjectId, ref: "Child" }],
    lastLogin: Date,
    password: {
      type: String,
      minimum: [5, "Password cannot be less than 5 characters"],
      required: [true, "Password is required"],
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
      select: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, rect) {
        rect.id = rect._id;
        delete rect._id;
        delete rect.__v;
      },
    },
  }
);

// Return Only Active Users
userSchema.pre(/^find/, function (this: Query<UserTypes[], UserTypes>, next) {
  this.find({ active: { $ne: false } });
  next();
});

// Input slug once Username is Registered
userSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Hash Password
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  }
});

// Update Slug after user changes their name
userSchema.pre("findOneAndUpdate", function (next) {
  const update: any = this.getUpdate();

  if (update?.name) {
    update.slug = slugify(update?.name, { lower: true });
  }

  next();
});

// Check if user's password and input passwords are the same
userSchema.methods.checkPassword = async function (
  inputPassword: string,
  userPassword: string
): Promise<boolean> {
  return await bcrypt.compare(inputPassword, userPassword);
};

// Check if user changed their password after token was issued
userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime(), 10);

    return JWTTimestamp < changedTimestamp / 1000;
  }

  return false;
};

// Create method for password reset token
userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

// Create method for user email verification token
userSchema.methods.createVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model<UserTypes>("User", userSchema);

export default User;
