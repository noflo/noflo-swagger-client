const { default: Component, fail } = require('noflo-assembly');

class AssemblyComponent extends Component {
  constructor(apiMethod, definition, icon) {
    super({
      description: definition.summary || definition.description,
      icon,
      // TODO: Set up validators from JSON Schema
    });
    this.apiMethod = apiMethod;
    this.apiDefinition = definition;
  }

  relay(msg, output) {
    this.apiMethod(msg.parameters)
      .then((response) => {
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
