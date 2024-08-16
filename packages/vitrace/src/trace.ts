import type { styleText as styleTextType } from 'node:util';

import { ansiToCssColor } from './color';
import { isBrowser, isNode } from './environment';
import { ensureError } from './helpers';
import { AnsiColor, TraceFunction } from './types';

let styleText: typeof styleTextType | undefined;

if (isNode()) {
  try {
    console.log('IS NODE', isNode());
    styleText = (await import('util')).styleText;

    if (!styleText) {
      console.warn(
        'vitrace: detected Node.js but `styleText` is not available, are you on Node.js >= 20.12.0?',
      );
    }
  } catch (error) {
    console.warn(
      'vitrace: an error ocurred attempting to load `styleText` output will be unstyled',
      ensureError(error),
    );
  }
}

const applyStyle = (
  text: string,
  color?: AnsiColor,
): string | [string, string, string] => {
  if (!color) return text;

  if (isNode() && styleText) {
    return styleText(color, text);
  }

  if (isBrowser()) {
    return [`%c${text}%c`, `color: ${ansiToCssColor(color)}`, ''];
  }

  return text;
};

export const createTraceFunction =
  (): TraceFunction =>
  (...args) => {
    if (args.length === 1) {
      const [value] = args;

      console.log(value);
      return value;
    }

    const [prefix, value] = args;

    console.log('PREFIX', prefix);

    const styledPrefix =
      typeof prefix === 'string'
        ? prefix
        : applyStyle(prefix.prefix, prefix.color);

    if (Array.isArray(styledPrefix)) {
      const [content, style, clear] = styledPrefix;
      console.log(`${content}:`, value, style, clear);
    } else {
      console.log(`${styledPrefix}:`, value);
    }

    return value;
  };

export const trace = createTraceFunction();
