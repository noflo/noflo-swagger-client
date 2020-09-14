const { default: Component, fail } = require('noflo-assembly');

class AssemblyComponent extends Component {
  constructor(apiMethod, definition) {
    super({
      description: definition.summary || definition.description,
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
          response,
        });
      }, (error) => {
        output.sendDone(fail(error));
      });
  }
}

function createComponent(method, definition = null) {
  return () => new AssemblyComponent(method, definition);
}

module.exports = createComponent;
