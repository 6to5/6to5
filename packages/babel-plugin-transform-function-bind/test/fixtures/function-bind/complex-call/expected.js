var _context;

import { map, takeWhile, forEach } from "iterlib";
(_context = (_context = (_context = getPlayers(), map).call(_context, function (x) {
  return x.character();
}), takeWhile).call(_context, function (x) {
  return x.strength > 100;
}), forEach).call(_context, function (x) {
  return console.log(x);
});