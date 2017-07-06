class C1<+T, -U> {}
function f<+T, -U>() {}
type T<+T, -U> = {};
type T = { +p: T };
type T = { -p: T };
type T = { +[k:K]: V };
type T = { -[k:K]: V };
interface I { +p: T }
interface I { -p: T }
interface I { +[k:K]: V }
interface I { -[k:K]: V }
declare class I { +p: T }
declare class I { -p: T }
declare class I { +[k:K]: V }
declare class I { -[k:K]: V }
class C2 { +p: T = e }
class C3 { -p: T = e }
