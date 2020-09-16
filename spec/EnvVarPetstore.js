const nock = require('nock');
const { registerSwaggerComponents } = require('../src/index');

describe('With env var replacement with PetStore OpenAPI v2', () => {
  let envVar;
  before(() => {
    envVar = process.env.SWAGGER_PETSTORE_API_KEY;
    delete process.env.SWAGGER_PETSTORE_API_KEY;
  });
  after(() => {
    process.env.PETSTORE_API_KEY = envVar;
  });
  describe('without env var set', () => {
    const loader = new noflo.ComponentLoader(process.cwd());
    const def = {
      url: 'http://petstore.swagger.io/v2/swagger.json',
    };
    before((done) => loader.listComponents(done));
    before(() => registerSwaggerComponents(loader, 'petstore', def));
    describe('registering Swagger components', () => {
    });
    describe('FindPetsByTags component', () => {
      let c;
      it('should be possible to load', (done) => {
        loader.load('petstore/FindPetsByTags', (err, instance) => {
          if (err) {
            done(err);
            return;
          }
          c = instance;
          done();
        });
      });
      describe('calling the API', () => {
        const tags = noflo.internalSocket.createSocket();
        const out = noflo.internalSocket.createSocket();
        const error = noflo.internalSocket.createSocket();
        before(() => {
          c.inPorts.tags.attach(tags);
          c.outPorts.out.attach(out);
          c.outPorts.error.attach(error);
        });
        after(() => {
          c.inPorts.tags.detach(tags);
          c.outPorts.out.detach(out);
          c.outPorts.error.detach(error);
          nock.cleanAll();
        });
        it('should not set the APIkey header', (done) => {
          const outData = [
            {
              hello: 'World',
            },
          ];
          const inTags = [
            'foo',
            'bar',
          ];
          const mock = nock('https://petstore.swagger.io', {
            badheaders: ['api_key'],
          })
            .get('/v2/pet/findByTags')
            .query((query) => {
              if (!Array.isArray(query.tags)) {
                return false;
              }
              return true;
            })
            .reply(200, outData);

          out.on('data', (data) => {
            chai.expect(mock.isDone());
            chai.expect(data.status).to.equal(200);
            chai.expect(data.body).to.eql(outData);
            done();
          });
          error.on('data', done);
          tags.send(inTags);
        });
      });
    });
  });
  describe('with env var set', () => {
    const secret = 'mysupersecret';
    const loader = new noflo.ComponentLoader(process.cwd());
    const def = {
      url: 'http://petstore.swagger.io/v2/swagger.json',
    };
    before(() => {
      process.env.PETSTORE_API_KEY = secret;
    });
    before((done) => loader.listComponents(done));
    before(() => registerSwaggerComponents(loader, 'petstore', def));
    describe('registering Swagger components', () => {
    });
    describe('FindPetsByTags component', () => {
      let c;
      it('should be possible to load', (done) => {
        loader.load('petstore/FindPetsByTags', (err, instance) => {
          if (err) {
            done(err);
            return;
          }
          c = instance;
          done();
        });
      });
      describe('calling the API', () => {
        const tags = noflo.internalSocket.createSocket();
        const out = noflo.internalSocket.createSocket();
        const error = noflo.internalSocket.createSocket();
        before(() => {
          c.inPorts.tags.attach(tags);
          c.outPorts.out.attach(out);
          c.outPorts.error.attach(error);
        });
        after(() => {
          c.inPorts.tags.detach(tags);
          c.outPorts.out.detach(out);
          c.outPorts.error.detach(error);
          nock.cleanAll();
        });
        it('should set the APIkey header', (done) => {
          const outData = [
            {
              hello: 'World',
            },
          ];
          const inTags = [
            'foo',
            'bar',
          ];
          const mock = nock('https://petstore.swagger.io', {
            reqheaders: {
              api_key: secret,
            },
          })
            .get('/v2/pet/findByTags')
            .query((query) => {
              if (!Array.isArray(query.tags)) {
                return false;
              }
              return true;
            })
            .reply(200, outData);

          out.on('data', (data) => {
            chai.expect(mock.isDone());
            chai.expect(data.status).to.equal(200);
            chai.expect(data.body).to.eql(outData);
            done();
          });
          error.on('data', done);
          tags.send(inTags);
        });
      });
    });
  });
});
