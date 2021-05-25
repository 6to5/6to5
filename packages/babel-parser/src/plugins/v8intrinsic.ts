import Parser from "../parser";
import { types as tt } from "../tokenizer/types";
import * as N from "../types";
import type { ExpressionErrors } from "../parser/util";

export default (superClass: typeof Parser) =>
  class V8IntrinsicMixin extends superClass implements Parser {
    parseV8Intrinsic(): N.Expression {
      if (this.match(tt.modulo)) {
        const v8IntrinsicStart = this.state.start;
        // let the `loc` of Identifier starts from `%`
        const node = this.startNode();
        this.eat(tt.modulo);
        if (this.match(tt.name)) {
          const name = this.parseIdentifierName(this.state.start);
          const identifier = this.createIdentifier(node, name);
          // @ts-expect-error todo(flow->ts) avoid mutations
          identifier.type = "V8IntrinsicIdentifier";
          if (this.match(tt.parenL)) {
            return identifier;
          }
        }
        this.unexpected(v8IntrinsicStart);
      }
    }

    /* ============================================================ *
     * parser/expression.js                                         *
     * ============================================================ */

    parseExprAtom(refExpressionErrors?: ExpressionErrors | null): N.Expression {
      return (
        this.parseV8Intrinsic() || super.parseExprAtom(refExpressionErrors)
      );
    }
  };
