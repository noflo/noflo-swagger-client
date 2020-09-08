const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { registerSwaggerComponents } = require('./index');

const readFile = promisify(fs.readFile);

function readPackageDefinition(baseDir) {
  const packageFile = path.resolve(baseDir, './package.json');
  return readFile(packageFile, 'utf-8')
    .then((contents) => JSON.parse(contents));
}

/*
 * Here we provide the classical declarative custom component loader interface that
 * can be enabled via package.json
 */
module.exports = (loader, done) => {
  readPackageDefinition(loader.baseDir)
    .then((packageDefinition) => {
      if (!packageDefinition.noflo.swagger
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
