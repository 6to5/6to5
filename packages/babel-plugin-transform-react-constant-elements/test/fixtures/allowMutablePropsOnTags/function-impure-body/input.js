function Component() {
  return () => <Counter onClick={value => value + prompt("Increment:")} />;
}
