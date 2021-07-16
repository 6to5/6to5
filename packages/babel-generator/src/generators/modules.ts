import type Printer from "../printer";
import * as t from "@babel/types";

export function ImportSpecifier(this: Printer, node: t.ImportSpecifier) {
  if (node.importKind === "type" || node.importKind === "typeof") {
    this.word(node.importKind);
    this.space();
  }

  this.print(node.imported, node);
  // @ts-expect-error todo(flow-ts) maybe check node type instead of relying on name to be undefined on t.StringLiteral
  if (node.local && node.local.name !== node.imported.name) {
    this.space();
    this.word("as");
    this.space();
    this.print(node.local, node);
  }
}

export function ImportDefaultSpecifier(
  this: Printer,
  node: t.ImportDefaultSpecifier,
) {
  this.print(node.local, node);
}

export function ExportDefaultSpecifier(
  this: Printer,
  node: t.ExportDefaultSpecifier,
) {
  this.print(node.exported, node);
}

export function ExportSpecifier(this: Printer, node: t.ExportSpecifier) {
  this.print(node.local, node);
  // @ts-expect-error todo(flow-ts) maybe check node type instead of relying on name to be undefined on t.StringLiteral
  if (node.exported && node.local.name !== node.exported.name) {
    this.space();
    this.word("as");
    this.space();
    this.print(node.exported, node);
  }
}

export function ExportNamespaceSpecifier(
  this: Printer,
  node: t.ExportNamespaceSpecifier,
) {
  this.token("*");
  this.space();
  this.word("as");
  this.space();
  this.print(node.exported, node);
}

export function ExportAllDeclaration(
  this: Printer,
  node: t.ExportAllDeclaration,
) {
  this.word("export");
  this.space();
  if (node.exportKind === "type") {
    this.word("type");
    this.space();
  }
  this.token("*");
  this.space();
  this.word("from");
  this.space();
  this.print(node.source, node);
  this.printAssertions(node);
  this.semicolon();
}

export function ExportNamedDeclaration(
  this: Printer,
  node: t.ExportNamedDeclaration,
) {
  if (t.isClassDeclaration(node.declaration)) {
    if (process.env.BABEL_8_BREAKING) {
      this.printJoin(node.declaration.decorators, node);
    } else if ((this.format as any).decoratorsBeforeExport) {
      this.printJoin(node.declaration.decorators, node);
    }
  }

  this.word("export");
  this.space();
  ExportDeclaration.apply(this, arguments);
}

export function ExportDefaultDeclaration(
  this: Printer,
  node: t.ExportDefaultDeclaration,
) {
  if (t.isClassDeclaration(node.declaration)) {
    if (process.env.BABEL_8_BREAKING) {
      this.printJoin(node.declaration.decorators, node);
    } else if ((this.format as any).decoratorsBeforeExport) {
      this.printJoin(node.declaration.decorators, node);
    }
  }

  this.word("export");
  this.space();
  this.word("default");
  this.space();
  ExportDeclaration.apply(this, arguments);
}

function ExportDeclaration(node: any) {
  if (node.declaration) {
    const declar = node.declaration;
    this.print(declar, node);
    if (!t.isStatement(declar)) this.semicolon();
  } else {
    if (node.exportKind === "type") {
      this.word("type");
      this.space();
    }

    const specifiers = node.specifiers.slice(0);

    // print "special" specifiers first
    let hasSpecial = false;
    for (;;) {
      const first = specifiers[0];
      if (
        t.isExportDefaultSpecifier(first) ||
        t.isExportNamespaceSpecifier(first)
      ) {
        hasSpecial = true;
        this.print(specifiers.shift(), node);
        if (specifiers.length) {
          this.token(",");
          this.space();
        }
      } else {
        break;
      }
    }

    if (specifiers.length || (!specifiers.length && !hasSpecial)) {
      this.token("{");
      if (specifiers.length) {
        this.space();
        this.printList(specifiers, node);
        this.space();
      }
      this.token("}");
    }

    if (node.source) {
      this.space();
      this.word("from");
      this.space();
      this.print(node.source, node);
      this.printAssertions(node);
    }

    this.semicolon();
  }
}

export function ImportDeclaration(this: Printer, node: t.ImportDeclaration) {
  this.word("import");
  this.space();

  if (node.importKind === "type" || node.importKind === "typeof") {
    this.word(node.importKind);
    this.space();
  }

  const specifiers = node.specifiers.slice(0);
  if (specifiers?.length) {
    // print "special" specifiers first
    for (;;) {
      const first = specifiers[0];
      if (
        t.isImportDefaultSpecifier(first) ||
        t.isImportNamespaceSpecifier(first)
      ) {
        this.print(specifiers.shift(), node);
        if (specifiers.length) {
          this.token(",");
          this.space();
        }
      } else {
        break;
      }
    }

    if (specifiers.length) {
      this.token("{");
      this.space();
      this.printList(specifiers, node);
      this.space();
      this.token("}");
    }

    this.space();
    this.word("from");
    this.space();
  }

  this.print(node.source, node);

  this.printAssertions(node);
  if (!process.env.BABEL_8_BREAKING) {
    // @ts-expect-error
    if (node.attributes?.length) {
      this.space();
      this.word("with");
      this.space();
      // @ts-expect-error
      this.printList(node.attributes, node);
    }
  }

  this.semicolon();
}

export function ImportAttribute(this: Printer, node: t.ImportAttribute) {
  this.print(node.key);
  this.token(":");
  this.space();
  this.print(node.value);
}

export function ImportNamespaceSpecifier(
  this: Printer,
  node: t.ImportNamespaceSpecifier,
) {
  this.token("*");
  this.space();
  this.word("as");
  this.space();
  this.print(node.local, node);
}
