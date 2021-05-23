import type Parser from "../parser";
import { types as tt } from "../tokenizer/types";
import * as N from "../types";

export default (superClass: Class<Parser>): Class<Parser> =>
  class extends superClass {
    parseV8Intrinsic(): N.Expression {
      if (this.match(tt.modulo)) {
        const v8IntrinsicStart = this.state.start;
        // let the `loc` of Identifier starts from `%`
        const node = this.startNode();
        this.eat(tt.modulo);
        if (this.match(tt.name)) {
          const name = this.parseIdentifierName(this.state.start);
          const identifier = this.createIdentifier(node, name);
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

    parseExprAtom(): N.Expression {
      return this.parseV8Intrinsic() || super.parseExprAtom(...arguments);
    }
  };
