var bar = function () {};

bar.bind(foo);
var foo = {};
foo.bar.bind(foo);