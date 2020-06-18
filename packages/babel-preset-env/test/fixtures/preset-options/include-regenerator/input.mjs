
export async function foo() {
    return await new Promise(resolve => setTimeout(resolve, 1000));
}
