/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-css-modules"],
  rules: {
    "property-no-unknown": [true, { ignoreProperties: ["/^--/"] }],
    "selector-class-pattern": "^[a-z][a-zA-Z0-9]*$",
    "at-rule-empty-line-before": null,
    "no-descending-specificity": null,
  },
};
