function Component() {
  return () => <Counter init={(value => value + prompt("Increment:"))(2)} />;
}
