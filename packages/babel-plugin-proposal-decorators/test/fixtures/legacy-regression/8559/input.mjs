import {autobind} from 'core-decorators';

export default function wrap() {
	return function() {
		class Foo {
			@autobind
			method() {}
		}

		return Foo;
	};
}
