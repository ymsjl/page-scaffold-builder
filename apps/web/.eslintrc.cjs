const path = require("path");

module.exports = {
  root: true,
  ignorePatterns: [".eslintrc.cjs"],
  env: {
    browser: true,
    es2022: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [path.join(__dirname, "tsconfig.json")],
    tsconfigRootDir: __dirname,
  },
  extends: [
    "airbnb",
    "airbnb/hooks",
    "airbnb-typescript",
    "prettier",
    "plugin:prettier/recommended",
  ],
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        project: "./tsconfig.json",
      },
    },
  },
  rules: {
    "prettier/prettier": "error",
    "import/extensions": "off",
    "import/prefer-default-export": "off",
    "react/react-in-jsx-scope": "off",
    "react/function-component-definition": ["error", { namedComponents: "arrow-function" }],
    "react/jsx-filename-extension": ["warn", { extensions: [".tsx"] }],
    "react/prop-types": "off",
    "react/require-default-props": "off",
    "react/no-unused-prop-types": "off",
    "react/jsx-props-no-spreading": "off",
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
  },
  overrides: [
    {
      files: [
        "src/store/**/*Slice.ts",
        "src/store/**/reducers/**/*.{ts,tsx,js,jsx}",
        "**/src/store/**/*Slice.ts",
        "**/src/store/**/reducers/**/*.{ts,tsx,js,jsx}",
      ],
      rules: {
        "no-param-reassign": "off",
        "import/no-cycle": "off",
      },
    },
    {
      files: ["**/*.test.ts", "**/*.test.tsx"],
      env: {
        jest: true,
      },
      parserOptions: {
        project: [path.join(__dirname, "tsconfig.json")],
        tsconfigRootDir: __dirname,
      },
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: true },
        ],
      },
    },
    {
      files: ["vite.config.ts"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: true },
        ],
      },
    },
  ],
};
