var test = {
  /**
   * Before bracket init
   */
  ["a"]: "1",
  [
  /*
   * Inside bracket init
   */
  "b"]: "2",
  ["c"
  /*
   * After bracket key
   */
  ]: "3",
  // Before bracket, line comment
  ["d"]: "4",
  [// Inside bracket, line comment
  "e"]: "5",
  ["f" // After bracket, line comment
  ]: "6"
};