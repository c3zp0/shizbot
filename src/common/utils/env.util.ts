const extractString = (key: keyof NodeJS.ProcessEnv): string => {
    const envValue = process.env[key];
    if (!envValue) {
        throw new Error(`Environment variable ${key} isn't defined`);
    }
    return envValue;
};

const extractInt = (key: keyof NodeJS.ProcessEnv): number => {
    const envValue = parseInt(extractString(key));
    if (isNaN(envValue)) {
        throw new Error(`The ${key} not a number`);
    }
    return envValue;
};

export const envUtil = {
    extractString,
    extractInt,
};
