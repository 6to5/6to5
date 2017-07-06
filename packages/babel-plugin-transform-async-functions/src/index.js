import asyncSyntaxPlugin from "babel-plugin-syntax-async-functions";

export default function() {
  return {
    inherits: asyncSyntaxPlugin,
  };
}
