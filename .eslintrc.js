// {
//   "extends": ["next/core-web-vitals", "next/typescript"]
// }

module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "next/core-web-vitals",
    "prettier",
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: ["simple-import-sort", "prettier", "@typescript-eslint"],
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    "sort-imports": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react-hooks/exhaustive-deps": "off",
    "simple-import-sort/imports": [
      2,
      {
        groups: [
          ["^.+\\.s?css$"],
          [
            `^(${require("module").builtinModules.join("|")})(/|$)`,
            "^react",
            "^@?\\w",
          ],
          ["^components(/.*|$)"],
          ["^lib(/.*|$)", "^hooks(/.*|$)"],
          ["^\\."],
        ],
      },
    ],
  },
  settings: {
    tailwindcss: {
      callees: ["cn"],
      config: "tailwind.config.js",
    },
  },
}
