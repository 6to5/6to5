function render(flag) {
  if (flag) {
    var bar = "bar";
    [].map(() => bar);
    return <foo bar={bar} />;
  }

  return null;
}