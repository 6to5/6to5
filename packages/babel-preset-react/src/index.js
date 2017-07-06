import presetFlow from "babel-preset-flow";
import transformReactJSX from "babel-plugin-transform-react-jsx";
import transformSyntaxJSX from "babel-plugin-syntax-jsx";
import transformReactDisplayName from "babel-plugin-transform-react-display-name";

export default function() {
  return {
    presets: [presetFlow],
    plugins: [transformReactJSX, transformSyntaxJSX, transformReactDisplayName],
  };
}
