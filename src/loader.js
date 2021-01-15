const { registerSwaggerComponents } = require('./index');
const loadfile = require('./loadfile');

function readPackageDefinition(baseDir) {
  return loadfile(baseDir, './package.json');
}

/*
 * Here we provide the classical declarative custom component loader interface that
 * can be enabled via package.json
 */
module.exports = (loader, done) => {
  readPackageDefinition(loader.baseDir)
    .then((packageDefinition) => {
      if (!packageDefinition.noflo
        || !packageDefinition.noflo.swagger
        || Object.keys(packageDefinition.noflo.swagger).length === 0) {
        // No registered Swagger endpoints
        return Promise.resolve();
      }
      return Promise.all(Object.keys(packageDefinition.noflo.swagger).map(
        (namespace) => registerSwaggerComponents(
          loader,
          namespace,
          packageDefinition.noflo.swagger[namespace],
        ),
      ));
    })
    .then(() => {
      done();
    }, (err) => {
      done(err);
    });
};
