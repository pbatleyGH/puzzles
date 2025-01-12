// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
// import jesteslint from "eslint-plugin-jest";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  //   jesteslint.configs.recommended, // TODO
);
