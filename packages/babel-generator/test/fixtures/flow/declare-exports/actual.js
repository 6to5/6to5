declare export var foo
declare export var foo;
declare export function foo(): void
declare export function foo(): void;
declare export function foo<T>(): void;
declare export function foo(x: number, y: string): void;
declare export class A {}
declare export class A<T> extends B<T> { x: number }
declare export class A { static foo(): number; static x : string }
declare export class A { static [ indexer: number]: string }
declare export class A { static () : number }
declare export class A mixins B<T>, C {}
declare export default class A {}
declare export default function foo(): void;
declare export default string
declare export * from 'asd';
declare export { a, b };
declare export {};
declare export { c, d } from 'bar';

declare module B {
  declare export type B = {};
  declare export interface Moon {}
}
