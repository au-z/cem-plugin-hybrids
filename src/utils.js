import ts from 'typescript';

export function isPrimitive(node) {
  return (
    (node &&
      (ts.isNumericLiteral(node) ||
        ts.isStringLiteral(node) ||
        node?.kind === ts.SyntaxKind.NullKeyword ||
        node?.kind === ts.SyntaxKind.TrueKeyword ||
        node?.kind === ts.SyntaxKind.FalseKeyword)) ||
    // Handle only empty arrays for now
    (node?.kind === ts.SyntaxKind.ArrayLiteralExpression && node?.elements?.length === 0)
  );
}

export function handleTypeInference(doc, node) {
  const n = node?.initializer || node;
  switch (n?.kind) {
    case ts.SyntaxKind.TrueKeyword:
    case ts.SyntaxKind.FalseKeyword:
      doc.type = { text: 'boolean' };
      break;
    case ts.SyntaxKind.StringLiteral:
      doc.type = { text: 'string' };
      break;
    case ts.SyntaxKind.PrefixUnaryExpression:
      doc.type = n?.operator === ts.SyntaxKind.ExclamationToken ? { text: 'boolean' } : { text: 'number' };
      break;
    case ts.SyntaxKind.NumericLiteral:
      doc.type = { text: 'number' };
      break;
    case ts.SyntaxKind.NullKeyword:
      doc.type = { text: 'null' };
      break;
    case ts.SyntaxKind.ArrayLiteralExpression:
      doc.type = { text: 'array' };
      break;
    case ts.SyntaxKind.ObjectLiteralExpression:
      doc.type = { text: 'object' };
      break;
  }
  return doc;
}

export const getReturnValue = (returnStatement) => {
  let value =
    returnStatement.expression?.kind === ts.SyntaxKind.AsExpression
      ? returnStatement.expression.expression.getText()
      : returnStatement.expression?.getText();

  return value?.split?.(' ')?.[0];
};

export const toKebabCase = (str) => {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}` : letter;
    })
    .join('');
};
