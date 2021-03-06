var _Counter;

function Component() {
  return () => _Counter || (_Counter = <Counter onClick={value => value + prompt("Increment:")} />);
}
