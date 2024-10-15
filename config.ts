interface ENV {
    NODE_ENV: string;
    PORT: number;

    DATABASE: string;
    DATABASE_PASSWORD: string;

    APP_NAME: string;
}

const Config = (): ENV => {
    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: +(process.env.PORT as string),

        DATABASE: process.env.DATABASE as string,
        DATABASE_PASSWORD: process.env.DATABASE_PASSWORD as string,

        APP_NAME: process.env.APP_NAME as string
    }
}


const sanitizeConfig = (Config: ENV): ENV => {
    for (const [key, value] of Object.entries(Config)) {
        if (value === undefined) throw new Error(`Cannot locate key ${key} in config.env`);
    }

    return Config;
}

const config = sanitizeConfig(Config());

export default config;