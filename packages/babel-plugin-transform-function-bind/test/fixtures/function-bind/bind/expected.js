var _context;

var f = (_context = ctx, ns.obj.func).bind(_context);

var g = (_context = ns.obj).func.bind(_context);

var h = (_context = new X(), y).bind(_context);