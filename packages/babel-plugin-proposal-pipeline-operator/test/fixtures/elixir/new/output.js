var _len, _pat, _BaZaaR;

const len = 5;
const arr = (_len = len, new Array(_len));
expect(arr.constructor).toBe(Array);
expect(arr.length).toBe(len);
const pat = "baza+r";
const re = (_pat = pat, new RegExp(_pat, "i"));
expect(re.constructor).toBe(RegExp);
expect(re.source).toBe(pat);
expect(re.ignoreCase).toBe(true);
expect((_BaZaaR = "BaZaaR", re.test(_BaZaaR))).toBe(true);
