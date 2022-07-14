import type { Config } from '@jest/types';

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '/__tests__/.*.test(\\..+)?\\.ts$',
  'collectCoverageFrom': ['src/**/*.ts'],
};

export default config;
