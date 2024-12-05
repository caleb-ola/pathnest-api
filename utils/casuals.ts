import crypto from "crypto";

export const createRandomUsername = (username: string, length: number = 6) => {
  const randomSuffix = crypto.randomBytes(length).toString("hex");
  const formattedUsername = username.toLowerCase().replace(/\s/g, "_");
  return `${formattedUsername}${randomSuffix}`;
};
