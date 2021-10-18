module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: [
    "@typescript-eslint",
    "eslint-plugin-tsdoc"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  rules: {
    quotes: ["error", "single", {avoidEscape: true}],
    semi: ["error", "always"],
    "@typescript-eslint/no-namespace": [2, {allowDeclarations: true}],
    "tsdoc/syntax": "warn"
  },
  ignorePatterns: ["*.js"]
}