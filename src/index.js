import { handleTypeInference, toKebabCase } from '../src/utils.js';

export default function myPlugin() {
  let DEV = false;
  const log = (...msgs) => DEV && console.log(...msgs);
  let TS;

  return {
    name: 'my-plugin',
    // Runs for all modules in a project, before continuing to the `analyzePhase`
    collectPhase({ ts, node, context }) {
      DEV = context.dev;

      // TODO: set from options
      context.tagPropertyName = 'tag';
      context.reservedProperties = ['render', 'content'];
      context.prefixPrivateProperty = '_';
    },
    // Runs for each module
    analyzePhase({ ts, node, moduleDoc, context }) {
      TS = ts;
      // You can use this phase to access a module's AST nodes and mutate the custom-elements-manifest
      switch (node.kind) {
        case ts.SyntaxKind.VariableDeclaration:
          if (node.initializer?.expression?.getText() === 'define') {
            const elementName = node.name?.getText();
            const elementDefn = node.initializer?.arguments?.[0];
            const { tag, members } = analyzeHybridsDefinition(elementDefn, context);

            const declaration = moduleDoc.declarations.find((d) => d.name === elementName);
            declaration.customElement = true;
            declaration.name = elementName;
            declaration.tag = tag;
            declaration.description = '';
            declaration.members = members;
          }
          break;
      }
    },
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({ moduleDoc, context }) {},
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {},
  };

  function analyzeHybridsDefinition(object, context) {
    let tag = '';
    let members = [];

    for (let property of object.properties) {
      const name = property?.name?.getText();
      const isPrivate = (context.prefixPrivateProperty && name?.indexOf(context.prefixPrivateProperty) === 0) || false;
      const isReserved = context.reservedProperties?.includes(name) || false;
      if (isReserved || isPrivate) continue;

      if (name === context.tagPropertyName) {
        tag = property?.initializer?.text;
      } else {
        const member = analyzeProperty(property, context);
        member && members.push(member);
      }
    }

    return { tag, members };
  }

  function analyzeProperty(propertyNode, context) {
    const initializerNode = propertyNode.initializer;
    if (initializerNode?.kind === TS.SyntaxKind.ArrowFunction) {
      return null;
    }

    const name = propertyNode.name?.getText();
    const attributeName = toKebabCase(name);
    let member = handleTypeInference({ kind: 'field', name }, propertyNode);
    member.default = defaultFromLiteral(propertyNode.initializer);
    if (name !== attributeName) {
      member.attribute = attributeName;
    }

    if (initializerNode?.kind === TS.SyntaxKind.ObjectLiteralExpression) {
      let valueProperty = null;
      let getterProperty = null;
      let setterProperty = null;
      for (let property of initializerNode?.properties) {
        valueProperty = property.name?.getText() === 'value' ? property : valueProperty;
        getterProperty = property.name?.getText() === 'get' ? property : getterProperty;
        setterProperty = property.name?.getText() === 'set' ? property : setterProperty;
      }

      // if a descriptor can't be set, we assume it's private
      console.log(name, TS.SyntaxKind[initializerNode?.kind], !!valueProperty, !!getterProperty, !!setterProperty);
      if (setterProperty || valueProperty) {
        analyzeDescriptor(initializerNode, member);
      } else {
        return null;
      }
    }

    return member;
  }

  function analyzeDescriptor(initializerNode, member) {
    let hasValue = false;
    initializerNode.properties.forEach((propertyNode) => {
      let name = propertyNode.name?.getText();
      if (name === 'value') {
        hasValue = true;
        member = handleTypeInference(member, propertyNode);
        member.default = defaultFromLiteral(propertyNode.initializer);
      }
      if (name === 'get' && !hasValue) {
        analyzeGetterFn(propertyNode.initializer, member);
      }
    });
  }

  function analyzeGetterFn(initializerNode, member) {
    const valueLiteral = initializerNode.parameters?.[1]?.initializer;
    if (valueLiteral) {
      member = handleTypeInference(member, valueLiteral);
      member.default = defaultFromLiteral(valueLiteral);
      console.log(member);
    }
  }

  function defaultFromLiteral(initializerNode) {
    switch (initializerNode.kind) {
      // TODO: not sure where 'false' and 'true' are in AST
      case TS.SyntaxKind.FalseKeyword:
        return 'false';
      case TS.SyntaxKind.TrueKeyword:
        return 'true';
      case TS.SyntaxKind.StringLiteral:
      default:
        return initializerNode.text;
    }
  }
}
