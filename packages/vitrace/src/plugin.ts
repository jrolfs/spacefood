import micromatch from 'micromatch';
import type { Plugin } from 'vite';

import { isTruthy } from './helpers';
import { createTraceFunction } from './trace';
import { TraceFunction, TracePluginOptions } from './types';

const injectTraceFunction = (trace: TraceFunction): string => `
(${(() => {
  const targets = [
    typeof globalThis !== 'undefined' && globalThis,
    typeof window !== 'undefined' && window,
    typeof global !== 'undefined' && global,
  ].filter(isTruthy);

  targets.forEach(target => {
    // @ts-expect-error we're serializing and injecting this function
    target.trace = trace.toString();
  });
}).toString()})()
`;

const tracePlugin = (options: TracePluginOptions = {}): Plugin => {
  const fileGlob =
    options.files ?? '**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue,svelte}';

  return {
    name: 'vitrace',

    config: () => {
      const targets = [
        typeof globalThis !== 'undefined' && globalThis,
        typeof global !== 'undefined' && global,
      ].filter(isTruthy);

      targets.forEach(target => {
        target.trace = createTraceFunction();
      });
    },

    transform: (code: string, id: string) =>
      micromatch.isMatch(id, fileGlob)
        ? {
            code: `${injectTraceFunction(createTraceFunction())}${code}`,
            map: null,
          }
        : undefined,
  };
};

export default tracePlugin;
