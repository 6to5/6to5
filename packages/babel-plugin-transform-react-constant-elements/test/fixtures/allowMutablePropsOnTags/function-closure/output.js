function Component({
  increment
}) {
  var _Counter;

  return () => _Counter || (_Counter = <Counter onClick={value => value + increment} />);
}
