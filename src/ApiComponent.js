const { Component } = require('noflo');
const slug = require('slug');

function parameterToNoFlo(param) {
  let datatype;
  switch (param.type) {
    case 'string': {
      datatype = 'string';
      break;
    }
    case 'number': {
      datatype = 'number';
      break;
    }
    case 'integer': {
      datatype = 'int';
      break;
    }
    case 'boolean': {
      datatype = 'boolean';
      break;
    }
    case 'object': {
      datatype = 'object';
      break;
    }
    case 'array': {
      datatype = 'array';
      break;
    }
    default: {
      datatype = 'all';
    }
  }
  const nofloDef = {
    datatype,
    description: param.description,
  };
  if (param.enum) {
    nofloDef.values = param.enum;
  }

  // Special cases
  if (param.type === 'string' && param.format === 'date-time') {
    nofloDef.datatype = 'date';
  }
  return nofloDef;
}

function createBasicComponent(method, definition) {
  const c = new Component();
  if (definition) {
    c.description = definition.summary || definition.description;
    c.inPorts.add('in', {
      datatype: 'bang',
    });
  } else {
    c.inPorts.add('in', {
      datatype: 'object',
    });
  }
  c.outPorts.add('out', {
    datatype: 'all',
  });
  c.outPorts.add('error', {
    datatype: 'object',
  });
  return c.process((input, output) => {
    if (!input.hasData('in')) {
      return;
    }
    const parameters = input.getData('in');
    method(parameters)
      .then(
        (result) => output.sendDone({
          out: result,
        }),
        (error) => output.done(error),
      );
  });
}

function createComponent(method, definition = null) {
  return (metadata) => {
    if (!definition || !definition.parameters || !definition.parameters.length) {
      // Definition couldn't be found, create a very simple component
      return createBasicComponent(method, definition);
    }
    const c = new Component();
    c.description = definition.summary || definition.description;
    const portToParam = {};
    definition.parameters.forEach((param) => {
      const portName = slug(param.name);
      c.inPorts.add(portName, parameterToNoFlo(param));
      portToParam[portName] = param.name;
    });
    c.outPorts.add('out', {
      // TODO: Get from JSON Schema
      datatype: 'all',
    });
    c.outPorts.add('error', {
      datatype: 'object',
    });

    return c.process((input, output) => {
      // Check if all attached inports have data
      const attachedPorts = Object.keys(c.inPorts.ports).filter(
        (portName) => input.attached(portName).length > 0,
      );
      const waitingFor = attachedPorts.filter(
        (portName) => input.hasData(portName),
      );
      if (waitingFor.length > 0) {
        return;
      }
      const parameters = {};
      attachedPorts.forEach((portName) => {
        const key = portToParam[portName];
        const val = input.getData(portName);
        parameters[key] = val;
      });
      method(parameters)
        .then(
          (result) => output.sendDone({
            out: result,
          }),
          (error) => output.done(error),
        );
    });
  });
}
module.exports = createComponent;
