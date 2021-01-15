const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const yaml = require('js-yaml');

const readFile = promisify(fs.readFile);

module.exports = (baseDir, filePath) => {
  const file = path.resolve(baseDir, filePath);
  return readFile(file, 'utf-8')
    .then((contents) => {
      switch (path.extname(filePath)) {
        case '.json': {
          return JSON.parse(contents);
        }
        case '.yaml': {
          return yaml.load(contents, {
            filename: file,
          });
        }
        default: {
          return contents;
        }
      }
    });
};
