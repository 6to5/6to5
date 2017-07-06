import transformExponentiationOperator from "babel-plugin-transform-exponentiation-operator";

export default function() {
  return {
    plugins: [transformExponentiationOperator],
  };
}
