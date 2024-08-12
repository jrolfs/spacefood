const {
  plugins,
  rules,
  overrides,
  extends: extendz,
  ...react
} = require('@hover/javascript/eslint/react');

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: extendz.filter(extend => !extend.includes('jest')),
  plugins: plugins.filter(plugin => !plugin.includes('jest')),
  rules: Object.fromEntries(
    Object.entries(rules).filter(([rule]) => !rule.includes('jest')),
  ),
  overrides: overrides.filter(
    override =>
      !Object.entries(override.rules).some(([rule]) => rule.includes('jest')),
  ),
  ...react,
};
