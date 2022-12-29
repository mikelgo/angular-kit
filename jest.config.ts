import { getJestProjects } from '@nrwl/jest';

export default {
  projects: getJestProjects(),
  setupFilesAfterEnv: [
    '<rootDir>/node_modules/@hirez_io/observer-spy/dist/setup-auto-unsubscribe.js',
  ],
};
