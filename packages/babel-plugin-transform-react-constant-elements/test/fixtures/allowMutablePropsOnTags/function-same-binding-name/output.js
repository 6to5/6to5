var _Counter;

function Component({
  value
}) {
  return () => _Counter || (_Counter = <Counter onClick={value => value + 1} />);
}
