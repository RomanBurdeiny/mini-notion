const isTest = process.env.NODE_ENV === 'test';

export const logger = {
  info: (...args: unknown[]) => {
    if (!isTest) {
      console.log(...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (!isTest) {
      console.warn(...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error(...args);
  },
};
