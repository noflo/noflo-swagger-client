const { Component } = require('noflo');
const slug = require('slug');
const { parameterToNoFlo } = require('./schemaHelpers');

function createBasicComponent(method, definition, icon) {
  const c = new Component();
  c.icon = icon;
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

function createQueryComponent(method, definition, icon) {
  const c = new Component();
  c.icon = icon;
  c.description = definition.summary || definition.description;
  const portToParam = {};
  let usesBody = false;
  definition.parameters.forEach((param) => {
    if (param.name === 'body'
      && definition.parameters.length === 1
      && param.schema
      && param.schema.type === 'object') {
      // Special-case when body is the only parameter
      usesBody = true;
      Object.keys(param.schema.properties).forEach((prop) => {
        const portName = slug(prop);
        const portDef = parameterToNoFlo(param.schema.properties[prop]);
        if (param.schema.required && param.schema.required.indexOf(prop) !== -1) {
          portDef.required = true;
        }
        c.inPorts.add(portName, portDef);
        portToParam[portName] = prop;
      });
      return;
    }
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
      (portName) => !input.hasData(portName),
    );
    if (waitingFor.length > 0) {
      return;
    }
    let parameters = {};
    attachedPorts.forEach((portName) => {
      const key = portToParam[portName];
      const val = input.getData(portName);
      parameters[key] = val;
    });
    if (usesBody) {
      parameters = {
        body: parameters,
      };
    }
    method(parameters)
      .then(
        (result) => output.sendDone({
          out: result,
        }),
        (error) => output.done(error),
      );
  });
}

function createBodyComponent(method, definition, icon) {
  const c = new Component();
  c.icon = icon;
  c.description = definition.summary || definition.description;
  const portToParam = {};
  const bodyType = Object.keys(definition.requestBody.content)[0];
  const { schema } = definition.requestBody.content[bodyType];
  Object.keys(schema.properties).forEach((prop) => {
    const portName = slug(prop);
    const portDef = parameterToNoFlo(schema.properties[prop]);
    if (schema.required && schema.required.indexOf(prop) !== -1) {
      portDef.required = true;
    }
    c.inPorts.add(portName, portDef);
    portToParam[portName] = prop;
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
      (portName) => !input.hasData(portName),
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
}

function createComponent(method, definition = null, icon = null) {
  return () => {
    if (definition && definition.parameters && definition.parameters.length) {
      return createQueryComponent(method, definition, icon);
    }
    if (definition && definition.requestBody && definition.requestBody.content) {
      return createBodyComponent(method, definition, icon);
    }
    // Definition couldn't be found, create a very simple component
    return createBasicComponent(method, definition, icon);
  };
}

module.exports = createComponent;
