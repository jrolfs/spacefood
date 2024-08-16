export type AnsiColor =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white'
  | 'gray'
  | 'redBright'
  | 'greenBright'
  | 'yellowBright'
  | 'blueBright'
  | 'magentaBright'
  | 'cyanBright'
  | 'whiteBright';

export interface ColorPrefix {
  prefix: string;
  color: AnsiColor;
}

export type TracePrefix = string | ColorPrefix;

export interface TracePluginOptions {
  files?: string;
}

export type TraceFunction = <T>(...args: [TracePrefix, T] | [T]) => T;

declare global {
  /**
   * Log a value to the console and return it
   *
   * @example
   * ```ts
   * const add = (a: number, b: number) => trace(a + b);
   *
   * const sum = add(1, 2); // Logs: 3
   * console.log(sum); // Logs: 3
   * ```
   *
   * @param value The value to log and return.
   *
   * @returns The input value.
   */
  function trace<T>(value: T): T;

  /**
   * Logs the value with a prefix to the console and returns the value.
   * @param prefix The prefix to use in the log message.
   * @param value The value to log and return.
   * @returns The input value.
   */
  function trace<T>(prefix: string, value: T): T;
}
