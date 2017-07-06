switch (foo) {}

switch (foo) {
  case "foo":
}

switch (foo) {
  default:
}

switch (foo) {
  case "foo":
  default:
}

switch (foo) {
  case "foo":
  case "bar":
  default:
}

switch (foo) {
  case "foo":
    foo();
    break;

  case "bar":
    bar();
    break;

  default:
    yay();
}

switch (foo) {
  case "foo":
    foo();

  case "bar":
    bar();

  default:
    yay();
}