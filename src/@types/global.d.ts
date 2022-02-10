import customLog from '../utils/custom-log';

declare global {
  interface Fastly {
    log: typeof customLog;
  }
}
