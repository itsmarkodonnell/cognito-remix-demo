import { isBrowser } from "./is-browser";

declare global {
  interface Window {
    env: {
      USERPOOL_ID: string;
      WEB_CLIENT_ID: string;
      USERPOOL_REGION: string;
    };
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_SECRET: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_ACCESS_KEY: string;
      USERPOOL_ID: string;
      WEB_CLIENT_ID: string;
      USERPOOL_REGION: string;
    }
  }
}

type EnvOptions = {
  isSecret?: boolean;
  isRequired?: boolean;
};
function getEnv(
  name: string,
  { isRequired, isSecret }: EnvOptions = { isSecret: true, isRequired: true }
) {
  if (isBrowser && isSecret) return "";
  const source = (isBrowser ? window.env : process.env) ?? {};

  const value = source[name as keyof typeof source];

  if (!value && isRequired) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export const NODE_ENV = getEnv("NODE_ENV");
export const SESSION_SECRET = getEnv("SESSION_SECRET", { isSecret: true });

/**
 * AWS keys
 */
export const AWS_ACCESS_KEY_ID = getEnv("AWS_ACCESS_KEY_ID", {
  isSecret: false,
});
export const AWS_SECRET_ACCESS_KEY = getEnv("AWS_SECRET_ACCESS_KEY", {
  isSecret: false,
});

/**
 * Userpool envs
 */
export const USERPOOL_ID = getEnv("USERPOOL_ID");
export const WEB_CLIENT_ID = getEnv("WEB_CLIENT_ID");
export const USERPOOL_REGION = getEnv(
  "USERPOOL_REGION"
);
