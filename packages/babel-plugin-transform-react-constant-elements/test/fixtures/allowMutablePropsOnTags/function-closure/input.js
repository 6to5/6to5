function Component({ increment }) {
  return () => <Counter onClick={value => value + increment} />;
}
