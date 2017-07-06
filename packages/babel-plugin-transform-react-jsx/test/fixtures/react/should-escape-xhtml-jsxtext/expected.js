React.createElement(
  "div",
  null,
  "wow"
);
React.createElement(
  "div",
  null,
  "w\xF4w"
);
React.createElement(
  "div",
  null,
  "w & w"
);
React.createElement(
  "div",
  null,
  "w & w"
);
React.createElement(
  "div",
  null,
  "w \xA0 w"
);
React.createElement(
  "div",
  null,
  "this should not parse as unicode: \\u00a0"
);
React.createElement(
  "div",
  null,
  "this should parse as nbsp: \xA0 "
);
React.createElement(
  "div",
  null,
  "this should parse as unicode: ",
  '\u00a0 '
);
React.createElement(
  "div",
  null,
  "w < w"
);