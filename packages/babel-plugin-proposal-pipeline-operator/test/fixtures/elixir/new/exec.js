const len = 5;
const arr = len |> new Array;

expect(arr.constructor).toBe(Array);
expect(arr.length).toBe(len);

const pat = "baza+r";
const re = pat |> new RegExp("i");

expect(re.constructor).toBe(RegExp);
expect(re.source).toBe(pat);
expect(re.ignoreCase).toBe(true);

expect("BaZaaR" |> re.test()).toBe(true);
