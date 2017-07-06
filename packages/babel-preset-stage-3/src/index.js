import syntaxDynamicImport from "babel-plugin-syntax-dynamic-import";
import transformAsyncGeneratorFunctions from "babel-plugin-transform-async-generator-functions";
import transformObjectRestSpread from "babel-plugin-transform-object-rest-spread";
import transformUnicodePropertyRegex from "babel-plugin-transform-unicode-property-regex";

export default function() {
  return {
    plugins: [
      syntaxDynamicImport,
      transformAsyncGeneratorFunctions,
      transformObjectRestSpread,
      transformUnicodePropertyRegex,
    ],
  };
}
