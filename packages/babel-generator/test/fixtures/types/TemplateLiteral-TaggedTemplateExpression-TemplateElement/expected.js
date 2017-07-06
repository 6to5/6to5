html`<b></b>`;
`multi
  lines`;
`test ${interpolation} test`;
`foob

  asdf
awer
    erqer`;
tag`\unicode and \u{55}`;
tag`\01`;
tag`\xg${0}right`;
tag`left${0}\xg`;
tag`left${0}\xg${1}right`;
tag`left${0}\u000g${1}right`;
tag`left${0}\u{-0}${1}right`;