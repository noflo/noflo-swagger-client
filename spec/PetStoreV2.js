const nock = require('nock');
const { registerSwaggerComponents } = require('../src/index');

describe('With PetStore OpenAPI v2 example', () => {
  const loader = new noflo.ComponentLoader(process.cwd());
  const def = {
    url: 'http://petstore.swagger.io/v2/swagger.json',
    icon: 'cart-plus',
  };
  before(() => loader.listComponents());
  describe('registering Swagger components', () => {
    before(() => registerSwaggerComponents(loader, 'petstore', def));
    it('should have registered components', () => {
      chai.expect(Object.keys(loader.components).length).to.be.above(1);
    });
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
    it('should have the expected ports', () => {
      chai.expect(c.inPorts.tags).to.be.an('object');
      chai.expect(c.outPorts.out).to.be.an('object');
      chai.expect(c.outPorts.error).to.be.an('object');
    });
    it('should have the correct icon', () => {
      chai.expect(c.getIcon()).to.equal('cart-plus');
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
      it('should return the query results', (done) => {
        const outData = [
          {
            hello: 'World',
          },
        ];
        const inTags = [
          'foo',
          'bar',
        ];
        const mock = nock('https://petstore.swagger.io')
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
  describe('AddPet component', () => {
    let c;
    it('should be possible to load', (done) => {
      loader.load('petstore/AddPet', (err, instance) => {
        if (err) {
          done(err);
          return;
        }
        c = instance;
        done();
      });
    });
    it('should have the expected ports', () => {
      chai.expect(c.inPorts.id).to.be.an('object');
      chai.expect(c.inPorts.name).to.be.an('object');
      chai.expect(c.inPorts.category).to.be.an('object');
      chai.expect(c.inPorts.tags).to.be.an('object');
      chai.expect(c.inPorts.status).to.be.an('object');
      chai.expect(c.outPorts.out).to.be.an('object');
      chai.expect(c.outPorts.error).to.be.an('object');
    });
    it('should have the correct icon', () => {
      chai.expect(c.getIcon()).to.equal('cart-plus');
    });
    describe('calling the API', () => {
      const name = noflo.internalSocket.createSocket();
      const category = noflo.internalSocket.createSocket();
      const status = noflo.internalSocket.createSocket();
      const out = noflo.internalSocket.createSocket();
      const error = noflo.internalSocket.createSocket();
      before(() => {
        c.inPorts.name.attach(name);
        c.inPorts.category.attach(category);
        c.inPorts.status.attach(status);
        c.outPorts.out.attach(out);
        c.outPorts.error.attach(error);
      });
      after(() => {
        c.inPorts.name.detach(name);
        c.inPorts.category.detach(category);
        c.inPorts.status.detach(status);
        c.outPorts.out.detach(out);
        c.outPorts.error.detach(error);
        nock.cleanAll();
      });
      it('should make a HTTP POST', (done) => {
        const mock = nock('https://petstore.swagger.io')
          .post('/v2/pet', (body) => {
            if (body.name !== 'Musti') {
              return false;
            }
            return true;
          })
          .reply(200);

        out.on('data', (data) => {
          chai.expect(mock.isDone());
          chai.expect(data.status).to.equal(200);
          done();
        });
        error.on('data', done);
        name.send('Musti');
        category.send({
          id: 1,
          name: 'dogs',
        });
        status.send('available');
      });
    });
  });
});
