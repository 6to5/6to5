var array = [10,20,30];

var last = array |> (a => a[a.length-1]);

expect(last).toBe(30);
