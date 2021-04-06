const nock = require('nock');
const { registerSwaggerComponents } = require('../src/index');

describe('With Assembly components for PetStore OpenAPI v2', () => {
  const loader = new noflo.ComponentLoader(process.cwd());
  const def = {
    url: 'http://petstore.swagger.io/v2/swagger.json',
    assembly: true,
    icon: 'cart-arrow-down',
  };
  before(() => loader.listComponents());
  describe('registering Swagger assembly components', () => {
    before(() => registerSwaggerComponents(loader, 'petstore', def));
    it('should have registered components', () => {
      chai.expect(Object.keys(loader.components).length).to.be.above(1);
    });
  });
  describe('FindPetsByTags component', () => {
    let c;
    it('should be possible to load', () => loader
      .load('petstore/FindPetsByTags')
      .then((instance) => {
        c = instance;
      }));
    it('should have the expected ports', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
      chai.expect(c.outPorts.out).to.be.an('object');
    });
    it('should have the correct icon', () => {
      chai.expect(c.getIcon()).to.equal('cart-arrow-down');
    });
    describe('calling the API', () => {
      const ins = noflo.internalSocket.createSocket();
      const out = noflo.internalSocket.createSocket();
      before(() => {
        c.inPorts.in.attach(ins);
        c.outPorts.out.attach(out);
      });
      after(() => {
        c.inPorts.in.detach(ins);
        c.outPorts.out.detach(out);
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
          chai.expect(data.response.status).to.equal(200);
          chai.expect(data.response.body).to.eql(outData);
          done();
        });
        ins.send({
          parameters: {
            tags: inTags,
          },
          errors: [],
        });
      });
    });
  });
  describe('AddPet component', () => {
    let c;
    it('should be possible to load', () => loader
      .load('petstore/AddPet')
      .then((instance) => {
        c = instance;
      }));
    it('should have the expected ports', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
      chai.expect(c.outPorts.out).to.be.an('object');
    });
    describe('calling the API', () => {
      const ins = noflo.internalSocket.createSocket();
      const out = noflo.internalSocket.createSocket();
      before(() => {
        c.inPorts.in.attach(ins);
        c.outPorts.out.attach(out);
      });
      after(() => {
        c.inPorts.in.detach(ins);
        c.outPorts.out.detach(out);
        nock.cleanAll();
      });
      it('should make a HTTP POST', (done) => {
        const mock = nock('https://petstore.swagger.io')
          .post('/v2/pet', (body) => {
            chai.expect(body.name).to.equal('Musti');
            return true;
          })
          .reply(200);

        out.on('data', (data) => {
          chai.expect(mock.isDone());
          chai.expect(data.response.status).to.equal(200);
          done();
        });
        ins.send({
          parameters: {
            body: {
              name: 'Musti',
              category: {
                id: 1,
                name: 'dogs',
              },
              status: 'available',
            },
          },
        });
      });
    });
  });
});
