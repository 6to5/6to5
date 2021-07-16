//
// These require toPropertyKey().
// If the call is missing, it's a hard error.
var { [fn()]: x, ...y } = z;
var { [i + 1]: x, ...y } = z;
var { ["string" && maybeNotString]: x, ...y } = z;
var { [maybeNotString || "string"]: x, ...y } = z;
var { [t ? "string" : maybeNotString]: x, ...y } = z;
var { [tag`can return anything`]: x, ...y } = z;

//
// These technically don't require toPropertyKey()
// but are pathological cases that our current evaluatesToString()
// heuristic does not identify. If someone improves the heuristic,
// please update the expected output of these accordingly.
var { [true && "string"]: x, ...y } = z;
var { ["" && irrelevant]: x, ...y } = z;
var { [false || "string"]: x, ...y } = z;
var { ["string" || irrelevant]: x, ...y } = z;
var { [(irrelevant, "string")]: x, ...y } = z;

//
// These don't require toPropertyKey().
// If toPropertyKey() is emitted here, it's a soft error
// due to wrong heuristic guess - perhaps minor performance
// penalty, otherwise harmless.
var { [typeof parrot]: ex, ...rest } = obj;
var { ["Norwegian" && "Blue"]: v, ...rest } = obj;
var { ["Pining for the fjords" || `Pushing up the daisies`]: v, ...rest } = obj;
var { ["I`ve got a " + slug]: v, ...rest } = obj;
var { [doesItTalk ? "Occasionally" : "Not really, no"]: v, ...rest } = obj;
var { [`Palindrome of ${town} would be ${palindrome(town)}`]: v, ...rest } = obj;
