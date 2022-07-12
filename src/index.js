import { extractDescriptorProperties, handleTypeInference, toKebabCase } from '../src/utils.js';

export default function CemPluginHybrids() {
  let TS2015
  const logNode = (node) => {
    console.log({ ...node, kind: TS2015.SyntaxKind[node.kind].toString(), parent: undefined })
  }

  return {
    name: 'my-plugin',
    // Runs for all modules in a project, before continuing to the `analyzePhase`
    collectPhase({ node, context }) {

      // TODO: set from plugin options
      context.tagPropertyName = 'tag';
      context.reservedProperties = ['render', 'content'];
      context.prefixPrivateProperty = '_';
      context.declaration = null; // holds the current element declaration
    },
    // Runs for each module
    analyzePhase({ ts, node, moduleDoc, context }) {
      TS2015 = ts
      // You can use this phase to access a module's AST nodes and mutate the custom-elements-manifest
      switch (node.kind) {
        case TS2015.SyntaxKind.VariableDeclaration:
          if (node.initializer?.expression?.getText() === 'define') {
            const elementName = node.name?.getText();
            const elementDefn = node.initializer?.arguments?.[0];
            const { tag, members } = analyzeHybridsDefinition(elementDefn, context);

            let declaration = moduleDoc.declarations.find((d) => d.name === elementName);
            if (!declaration) {
              declaration = { name: elementName }
              moduleDoc.declarations.push(declaration);
            }
            context.declaration = declaration;

            declaration.customElement = true;
            declaration.name = elementName;
            declaration.tag = tag;
            declaration.description = '';
            declaration.members = members;
          }
          break;
        case TS2015.SyntaxKind.CallExpression:
          if (node.expression?.escapedText === 'dispatch') {
            context.declaration.events = analyzeEvent(node, context)
          }
          break;
        case TS2015.SyntaxKind.TaggedTemplateExpression:
          if (node.tag?.escapedText === 'html') {
            context.declaration.slots = analyzeTemplate(node.template, context)
          }
          break;
      }
    },
    // Runs for each module, after analyzing, all information about your module should now be available
    moduleLinkPhase({ moduleDoc, context }) {
      moduleDoc.declarations.forEach((d) => {
        moduleDoc.exports.push({
          kind: "custom-element-definition",
          name: d.tag,
          declaration: {
            name: d.name,
            module: moduleDoc.path,
          },
        });
      });
      console.log(moduleDoc.declarations[1])
    },
    // Runs after modules have been parsed and after post-processing
    packageLinkPhase({ customElementsManifest, context }) {
    },
  };

  function analyzeHybridsDefinition(objectNode, context) {
    let tag = '';
    let members = [];

    for (let property of objectNode.properties) {
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

  /**
   * Analyzes a property of a Hybrids definition
   * @param {Node} propertyNode AST Hybrids property node
   * @param {object} context CEM Plugin context
   * @returns CEM Member object
   */
  function analyzeProperty(propertyNode, context) {
    const initializerNode = propertyNode.initializer;
    if (initializerNode?.kind === TS2015.SyntaxKind.ArrowFunction) {
      return null;
    }

    const name = propertyNode.name?.getText();
    const attributeName = toKebabCase(name);
    let member = handleTypeInference({ kind: 'field', name }, propertyNode);
    member.default = defaultFromLiteral(propertyNode.initializer);
    if (name !== attributeName) {
      member.attribute = attributeName;
    }

    if (initializerNode?.kind === TS2015.SyntaxKind.ObjectLiteralExpression) {
      const { value, getter, setter } = extractDescriptorProperties(initializerNode)

      // if a descriptor can't be set by property or attribute, we assume it's private
      if (setter || value) {
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
    logNode(initializerNode.parameters?.[1])
    const valueLiteral = initializerNode.parameters?.[1]?.initializer;
    if (valueLiteral) {
      member = handleTypeInference(member, valueLiteral);
      member.default = defaultFromLiteral(valueLiteral);
    }
  }

  function defaultFromLiteral(initializerNode) {
    switch (initializerNode.kind) {
      // TODO: not sure where 'false' and 'true' are in AST
      case TS2015.SyntaxKind.FalseKeyword:
        return 'false';
      case TS2015.SyntaxKind.TrueKeyword:
        return 'true';
      case TS2015.SyntaxKind.StringLiteral:
      default:
        return initializerNode.text;
    }
  }

  // Slots

  // TODO: support named slots by parsing <slot> attributes
  function analyzeTemplate(templateNode, context) {
    const slots = []
    templateNode.templateSpans?.forEach((span) => {
      if (span.literal?.text?.indexOf('<slot') > 0) {
        slots.push({ name: '' })
      }
    })
    return slots
  }

  // Events

  // TODO: support dispatch type arguments
  function analyzeEvent(dispatchCallExpr, context) {
    const events = []
    const name = dispatchCallExpr.arguments?.[1].text
    events.push({ name })
    return events;
  }
}
