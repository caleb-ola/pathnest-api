import mongoose, { Schema } from "mongoose";
import validator from "validator";

export interface RecommendationTypes {
  recommendation: string;
  inputs: number[];
  recommendationDesc: string;
  createdAt?: { type: DateConstructor; default: number };
}

export interface ChildTypes extends mongoose.Document {
  name: string;
  nickname?: string;
  dob: string | number;
  gender: string;
  recommendationHistory: RecommendationTypes[];
  parent: { type: Schema.Types.ObjectId; ref: "User" };
  partnerParent: string | undefined;
  slug: string;
  avatar: string;
  partnerRequests: any[];
  // partnerRequests: {
  //   email?: string;
  //   status?: string;
  //   createdAt?: { type: DateConstructor; default: number };
  // }[];
}

const recommendationSchema = new mongoose.Schema<RecommendationTypes>(
  {
    recommendation: {
      type: String,
      required: [true, "Recommendation is required"],
    },
    inputs: {
      type: [Number],
      required: [true, "Inputs are required"],
      min: [10, "Inputs cannot be less 10 values"],
      max: [10, "Inputs cannot be greater than 10 values"],
    },
    recommendationDesc: {
      type: String,
      required: [true, "Recommendation description is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
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

export const childSchema = new mongoose.Schema<ChildTypes>(
  {
    name: {
      type: String,
      required: [true, "Child's name is required"],
      max: [60, "Name cannot be more than 60 characters"],
    },
    nickname: {
      type: String,
      max: [60, "Nickname cannot be more than 60 characters"],
      lower: true,
    },
    dob: Date,
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    avatar: String,
    slug: String,
    // parents: {
    //   type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    //   max: [2, "Child cannot have more than two parents"],
    // },
    recommendationHistory: {
      type: [recommendationSchema],
    },
    parent: { type: Schema.Types.ObjectId, ref: "User" },
    partnerParent: { type: Schema.Types.ObjectId, ref: "User" },
    partnerRequests: [
      {
        // partner: { type: Schema.Types.ObjectId, ref: "User" },
        name: {
          type: String,
        },
        email: {
          type: String,
          lower: true,
          validate: [validator.isEmail, "Input must be an email"],
        },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now() },
      },
    ],
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

const Child = mongoose.model<ChildTypes>("Child", childSchema);

export default Child;
