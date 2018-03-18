import nameFunction from "@babel/helper-function-name";
import VanillaTransformer from "./vanilla";
import { types as t } from "@babel/core";

export default class LooseClassTransformer extends VanillaTransformer {
  constructor() {
    super(...arguments);
    this._protoAlias = null;
    this.isLoose = true;
  }

  _insertProtoAliasOnce() {
    if (!this._protoAlias) {
      this._protoAlias = this.scope.generateUidIdentifier("proto");
      const classProto = t.memberExpression(
        this.classRef,
        t.identifier("prototype"),
      );
      const protoDeclaration = t.variableDeclaration("var", [
        t.variableDeclarator(this._protoAlias, classProto),
      ]);

      this.body.push(protoDeclaration);
    }
  }

  _processMethod(node, scope) {
    if (!node.decorators) {
      // use assignments instead of define properties for loose classes

      let classRef = this.classRef;
      if (!node.static) {
        this._insertProtoAliasOnce();
        classRef = this._protoAlias;
      }
      const methodName = t.memberExpression(
        t.cloneNode(classRef),
        node.key,
        node.computed || t.isLiteral(node.key),
      );

      let func = t.functionExpression(
        null,
        node.params,
        node.body,
        node.generator,
        node.async,
      );
      func.returnType = node.returnType;
      const key = t.toComputedKey(node, node.key);
      if (t.isStringLiteral(key)) {
        func = nameFunction({
          node: func,
          id: key,
          scope,
        });
      }

      const expr = t.expressionStatement(
        t.assignmentExpression("=", methodName, func),
      );
      t.inheritsComments(expr, node);
      this.body.push(expr);
      return true;
    }
  }

  _isSingleSetGet(path) {
    const setGetMethods = new Set();
    let hasMethods = false;
    let hasComputedNode = false;
    path.container.map(containedNode => {
      if (containedNode.kind === "set" || containedNode.kind === "get") {
        setGetMethods.add(containedNode.key.name);
      }
      if (containedNode.kind === "method") {
        hasMethods = true;
      }
      if (containedNode.computed) {
        hasComputedNode = true;
      }
    });
    return !hasComputedNode && !hasMethods && setGetMethods.size === 1;
  }

  _getSetAndGetDetails(node, path) {
    let SET_FUNCTION_BODY = null;
    let GET_FUNCTION_BODY = null;
    const KEY = t.stringLiteral(node.key.name);
    const CLASS_NAME = t.identifier(this.classRef.name);
    const CONTAINER_LENGTH = path.container.length;
    let containerNodesTraversed = 0;
    let keyOfCurrentNodeInContainer = 0;

    while (containerNodesTraversed < CONTAINER_LENGTH) {
      containerNodesTraversed++;
      if (
        path.getSibling(keyOfCurrentNodeInContainer).node.kind === "constructor"
      ) {
        keyOfCurrentNodeInContainer++;
        continue;
      }

      if (path.getSibling(keyOfCurrentNodeInContainer).node.kind === "get") {
        GET_FUNCTION_BODY = t.functionExpression(
          null,
          path.getSibling(keyOfCurrentNodeInContainer).node.params,
          path.getSibling(keyOfCurrentNodeInContainer).node.body,
        );
      }

      if (path.getSibling(keyOfCurrentNodeInContainer).node.kind === "set") {
        SET_FUNCTION_BODY = t.functionExpression(
          null,
          path.getSibling(keyOfCurrentNodeInContainer).node.params,
          path.getSibling(keyOfCurrentNodeInContainer).node.body,
        );
      }
      path.getSibling(keyOfCurrentNodeInContainer).remove();
    }

    return {
      CLASS_NAME,
      KEY,
      GET_FUNCTION_BODY,
      SET_FUNCTION_BODY,
    };
  }

  _createObjectNode(CLASS_NAME, KEY, SET_FUNCTION_BODY, GET_FUNCTION_BODY) {
    const objectContent = [
      t.objectProperty(t.identifier("configurable"), t.booleanLiteral(true)),
    ];

    if (SET_FUNCTION_BODY) {
      objectContent.push(
        t.objectProperty(t.identifier("set"), SET_FUNCTION_BODY),
      );
    }

    if (GET_FUNCTION_BODY) {
      objectContent.push(
        t.objectProperty(t.identifier("get"), GET_FUNCTION_BODY),
      );
    }

    return t.blockStatement([
      t.expressionStatement(
        t.callExpression(
          t.memberExpression(
            t.identifier("Object"),
            t.identifier("defineProperty"),
          ),
          [CLASS_NAME, KEY, t.objectExpression(objectContent)],
        ),
      ),
    ]);
  }

  _processSetGet(node, path) {
    const shouldOptimize = this._isSingleSetGet(path);

    if (shouldOptimize) {
      const {
        CLASS_NAME,
        KEY,
        GET_FUNCTION_BODY,
        SET_FUNCTION_BODY,
      } = this._getSetAndGetDetails(node, path);
      this.body.push(
        this._createObjectNode(
          CLASS_NAME,
          KEY,
          GET_FUNCTION_BODY,
          SET_FUNCTION_BODY,
        ),
      );
      return true;
    }
    return false;
  }
}
