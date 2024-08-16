import { AnsiColor } from './types';

export const ANSI_TO_CSS: Record<AnsiColor, string> = {
  black: 'black',
  red: 'red',
  green: 'green',
  yellow: 'yellow',
  blue: 'blue',
  magenta: 'magenta',
  cyan: 'cyan',
  white: 'white',
  gray: 'gray',
  redBright: 'crimson',
  greenBright: 'limegreen',
  yellowBright: 'gold',
  blueBright: 'dodgerblue',
  magentaBright: 'fuchsia',
  cyanBright: 'aqua',
  whiteBright: 'white',
};

export const ansiToCssColor = (color: AnsiColor) => ANSI_TO_CSS[color];
