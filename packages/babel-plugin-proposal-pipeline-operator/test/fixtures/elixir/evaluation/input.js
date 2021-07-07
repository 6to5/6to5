var obj = {
  get prop() {
    return this._prop = 1;
  },

  get method() {
    if (!this._prop) throw new Error('invalid evaluation order');
    return (v) => v;
  }
}

var result = obj.prop |> obj.method();
expect(result).toBe(1);
