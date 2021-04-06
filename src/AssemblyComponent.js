const { Component, fail } = require('noflo-assembly');

class AssemblyComponent extends Component {
  constructor(apiMethod, definition, icon) {
    const def = definition || {};
    super({
      description: def.summary || def.description,
      icon,
      // TODO: Set up validators from JSON Schema
    });
    this.apiMethod = apiMethod;
    this.apiDefinition = definition;
  }

  relay(msg, output) {
    this.apiMethod(
      msg.parameters,
      // With OpenAPI 3, a request body is no longer read from parameters.body but from the second
      // parameter (value of key requestBody). That parameter is used with default value {} for
      // OpenAPI 2.
      // See: https://github.com/swagger-api/swagger-js/blob/master/docs/usage/tags-interface.md#openapi-v3x
      msg.parameters !== undefined && Object.keys(msg.parameters).find((key) => key === 'body')
        ? { requestBody: msg.parameters.body } : {},
    ).then((response) => {
      output.sendDone({
        ...msg,
        parameters: undefined,
        response,
      });
    }, (error) => {
      output.sendDone(fail(msg, error));
    });
  }
}

function createComponent(method, definition = null, icon = null) {
  return () => new AssemblyComponent(method, definition, icon);
}

module.exports = createComponent;
