export const ensureError = (value: unknown): Error => {
  if (value instanceof Error) return value;

  const message = 'Unexpected `throw` of non-`Error` value';

  try {
    const stringified = JSON.stringify(value);

    return new Error(`${message}, stringified below:\n${stringified}`);
  } catch {
    return new Error(`${message}, unable to stringify thrown value`);
  }
};

/**
 * Type guard helper for filtering lists that may have falsey items
 *
 * @example myList.filter(isTruthy)
 *
 * @param input potentially falsey value
 * @returns {boolean} whether input is truthy
 */
export const isTruthy = <T>(
  input: T | undefined | null | boolean,
): input is T => Boolean(input);
