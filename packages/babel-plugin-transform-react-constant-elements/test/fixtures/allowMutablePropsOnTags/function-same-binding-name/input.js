function Component({ value }) {
  return () => <Counter onClick={value => value + 1} />;
}
