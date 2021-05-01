expect(function () {
    const array = [1, 2, 3];
    for (const element of array) {
        const from = 50;
        from--;
    }
}).toThrow('"from" is read-only');