const swaggerClient = require('swagger-client');
const slug = require('slug');
const ApiComponent = require('./ApiComponent');

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

function registerComponentsForTag(loader, namespace, tag, client) {
  return Promise.all(Object.keys(client.apis[tag]).map((apiMethod) => {
    const definition = getDefinitionForMethod(client, tag, apiMethod);
    const implementation = client.apis[tag][apiMethod];
    const component = ApiComponent(implementation, definition);
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
  // TODO: Support for replacing authorizations with env var values
  return swaggerClient(definition)
    .then((client) => Promise.all(
      Object.keys(client.apis).map(
        (tag) => registerComponentsForTag(loader, namespace, tag, client),
      ),
    ));
}
exports.registerSwaggerComponents = registerSwaggerComponents;
