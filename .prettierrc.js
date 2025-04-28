// npm i -D prettier prettier-plugin-sql prettier-plugin-embed
export default {
  tabWidth: 2,
  printWidth: 100,
  embeddedLanguageFormatting: "auto",
  embeddedSqlTags: ["sql"],
  language: "sqlite",
  keywordCase: "upper",
  htmlWhitespaceSensitivity: "ignore", // otherwise it will wrap html beyond printWidth, and we don't want it
  plugins: ["prettier-plugin-sql", "prettier-plugin-embed"],
  overrides: [
    {
      files: ["*.md"],
      options: {
        proseWrap: "always",
        printWidth: 80,
      },
    },
  ],
};
