import mongoose, { Schema } from "mongoose";

export interface RecommendationTypes {
  recommendation: string;
  inputs: number[];
  recommendationDesc: string;
  createdAt: { type: DateConstructor; default: number };
}

export interface ChildTypes extends mongoose.Document {
  name: string;
  nickName?: string;
  dob: string | number;
  gender: string;
  recommendationHistory: RecommendationTypes[];
  parents: Array<{ type: Schema.Types.ObjectId; ref: "User" }>;
  slug: string;
  avatar: string;
}

const recommendationSchema = new mongoose.Schema<RecommendationTypes>(
  {
    recommendation: {
      type: String,
      required: [true, "Recomendation is required"],
    },
    inputs: {
      type: [Number],
      required: [true, "Inputs are required"],
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
    _id: false,
  }
);

const childSchema = new mongoose.Schema<ChildTypes>(
  {
    name: {
      type: String,
      required: [true, "Child's name is required"],
      max: [60, "Name cannot be more than 60 characters"],
    },
    nickName: {
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
    parents: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      max: [2, "Child cannot have more than two parents"],
    },
    recommendationHistory: {
      type: [recommendationSchema],
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

const Child = mongoose.model<ChildTypes>("Child", childSchema);

export default Child;
