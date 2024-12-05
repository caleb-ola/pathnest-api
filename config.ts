interface ENV {
  NODE_ENV: string;
  PORT: number;

  DATABASE: string;
  DATABASE_PASSWORD: string;

  JWT_SECRET: string;
  JWT_EXPIRES: string;

  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;

  BREVO_HOST: string;
  BREVO_PORT: number;
  BREVO_USER: string;
  BREVO_PASS: string;

  APP_NAME: string;
  APP_EMAIL_FROM: string;
  APP_CLIENT: string;
}

const Config = (): ENV => {
  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: +(process.env.PORT as string),

    DATABASE: process.env.DATABASE as string,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD as string,

    JWT_SECRET: process.env.JWT_SECRET as string,
    JWT_EXPIRES: process.env.JWT_EXPIRES as string,

    EMAIL_HOST: process.env.EMAIL_HOST as string,
    EMAIL_PORT: +(process.env.EMAIL_PORT as string),
    EMAIL_USER: process.env.EMAIL_USER as string,
    EMAIL_PASS: process.env.EMAIL_PASS as string,

    BREVO_HOST: process.env.BREVO_HOST as string,
    BREVO_PORT: +(process.env.BREVO_PORT as string),
    BREVO_USER: process.env.BREVO_USER as string,
    BREVO_PASS: process.env.BREVO_PASS as string,

    APP_NAME: process.env.APP_NAME as string,
    APP_EMAIL_FROM: process.env.APP_EMAIL_FROM as string,
    APP_CLIENT:
      process.env.NODE_ENV === "production"
        ? (process.env.APP_CLIENT_PROD as string)
        : (process.env.APP_CLIENT_DEV as string),
  };
};

const sanitizeConfig = (Config: ENV): ENV => {
  for (const [key, value] of Object.entries(Config)) {
    if (value === undefined)
      throw new Error(`Cannot locate key ${key} in config.env`);
  }

  return Config;
};

const config = sanitizeConfig(Config());

export default config;
