const nock = require('nock');
const { registerSwaggerComponents } = require('../src/index');

describe('With env var replacement with PetStore OpenAPI v2', () => {
  let envVar;
  before(() => {
    envVar = process.env.SWAGGER_PETSTORE_APIKEY;
    delete process.env.SWAGGER_PETSTORE_APIKEY;
  });
  after(() => {
    if (envVar) {
      process.env.SWAGGER_PETSTORE_APIKEY = envVar;
    } else {
      delete process.env.SWAGGER_PETSTORE_APIKEY;
    }
  });
  describe('without env var set', () => {
    const loader = new noflo.ComponentLoader(process.cwd());
    const def = {
      url: 'http://petstore.swagger.io/v2/swagger.json',
    };
    before(() => loader.listComponents());
    before(() => registerSwaggerComponents(loader, 'petstore', def));
    describe('FindPetsByTags component (without security)', () => {
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
    describe('GetInventory component (with security)', () => {
      let c;
      it('should be possible to load', (done) => {
        loader.load('petstore/GetInventory', (err, instance) => {
          if (err) {
            done(err);
            return;
          }
          c = instance;
          done();
        });
      });
      describe('calling the API', () => {
        const ins = noflo.internalSocket.createSocket();
        const out = noflo.internalSocket.createSocket();
        const error = noflo.internalSocket.createSocket();
        before(() => {
          c.inPorts.in.attach(ins);
          c.outPorts.out.attach(out);
          c.outPorts.error.attach(error);
        });
        after(() => {
          c.inPorts.in.detach(ins);
          c.outPorts.out.detach(out);
          c.outPorts.error.detach(error);
          nock.cleanAll();
        });
        it('should set the APIkey header', (done) => {
          const mock = nock('https://petstore.swagger.io', {
            badheaders: ['api_key'],
          })
            .get('/v2/store/inventory')
            .reply(401);

          out.on('data', () => {
            done(new Error('Received unexpected 200'));
          });
          error.on('data', (err) => {
            chai.expect(err.status).to.equal(401);
            chai.expect(mock.isDone());
            done();
          });
          ins.send(true);
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
      process.env.SWAGGER_PETSTORE_APIKEY = secret;
    });
    before((done) => loader.listComponents(done));
    before(() => registerSwaggerComponents(loader, 'petstore', def));
    describe('FindPetsByTags component (without security)', () => {
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
    describe('GetInventory component (with security)', () => {
      let c;
      it('should be possible to load', (done) => {
        loader.load('petstore/GetInventory', (err, instance) => {
          if (err) {
            done(err);
            return;
          }
          c = instance;
          done();
        });
      });
      describe('calling the API', () => {
        const ins = noflo.internalSocket.createSocket();
        const out = noflo.internalSocket.createSocket();
        const error = noflo.internalSocket.createSocket();
        before(() => {
          c.inPorts.in.attach(ins);
          c.outPorts.out.attach(out);
          c.outPorts.error.attach(error);
        });
        after(() => {
          c.inPorts.in.detach(ins);
          c.outPorts.out.detach(out);
          c.outPorts.error.detach(error);
          nock.cleanAll();
        });
        it('should set the APIkey header', (done) => {
          const outData = {
            sold: 0,
            available: 4,
          };
          const mock = nock('https://petstore.swagger.io', {
            reqheaders: {
              api_key: secret,
            },
          })
            .get('/v2/store/inventory')
            .reply(200, outData);

          out.on('data', (data) => {
            chai.expect(mock.isDone());
            chai.expect(data.status).to.equal(200);
            chai.expect(data.body).to.eql(outData);
            done();
          });
          error.on('data', done);
          ins.send(true);
        });
      });
    });
  });
});
