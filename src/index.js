const swaggerClient = require('swagger-client');
const slug = require('slug');
const ApiComponent = require('./ApiComponent');
const AssemblyComponent = require('./AssemblyComponent');
const loadfile = require('./loadfile');

function createEnvVar(namespace, key) {
  return `SWAGGER_${slug(namespace).toUpperCase()}_${slug(key).toUpperCase()}`;
}

function populateAuthorizations(namespace, client) {
  if (client.authorizations) {
    // Authorizations already present, skip
    return client;
  }
  if (!client.spec.securityDefinitions) {
    return client;
  }
  const c = client;
  Object.keys(client.spec.securityDefinitions).forEach((key) => {
    const envVar = createEnvVar(namespace, key);
    if (!process.env[envVar]) {
      return;
    }
    if (!c.authorizations) {
      c.authorizations = {};
    }
    c.authorizations[key] = process.env[envVar];
  });
  return client;
}

function getDefinitionForMethod(client, tag, method) {
  let def = null;
  Object.keys(client.spec.paths).forEach((path) => {
    Object.keys(client.spec.paths[path]).forEach((apiMethod) => {
      const spec = client.spec.paths[path][apiMethod];
      if (!spec.tags) {
        if (tag === 'default' && spec.operationId === 'method') {
          // Untagged method are registered for the default namespace
          def = spec;
        }
        return;
      }
      if (spec.tags.indexOf(tag) === -1) {
        return;
      }
      if (spec.operationId !== method) {
        return;
      }
      def = spec;
    });
  });
  return def;
}

function createNamespace(prefix) {
  return slug(prefix);
}

function registerComponentsForTag(loader, namespace, tag, client, assembly = false, icon = null) {
  return Promise.all(Object.keys(client.apis[tag]).map((apiMethod) => {
    const definition = getDefinitionForMethod(client, tag, apiMethod);
    const implementation = client.apis[tag][apiMethod];
    const componentFactory = assembly ? AssemblyComponent : ApiComponent;
    const component = componentFactory(implementation, definition, icon);
    const componentName = apiMethod.charAt(0).toUpperCase() + apiMethod.slice(1);
    return new Promise((resolve, reject) => {
      loader.registerComponent(createNamespace(namespace, tag), componentName, component, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }));
}

function registerSwaggerComponents(loader, namespace, definition) {
  if (definition && definition.file) {
    return loadfile(loader.baseDir, definition.file)
      .then((spec) => registerSwaggerComponents(loader, namespace, {
        ...definition,
        file: undefined,
        spec,
      }));
  }
  return swaggerClient(definition)
    .then((client) => populateAuthorizations(namespace, client))
    .then((client) => Promise.all(
      Object.keys(client.apis).map(
        (tag) => registerComponentsForTag(
          loader,
          namespace,
          tag,
          client,
          definition.assembly,
          definition.icon,
        ),
      ),
    ));
}
exports.registerSwaggerComponents = registerSwaggerComponents;
