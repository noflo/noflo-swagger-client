const { registerSwaggerComponents } = require('../src/index');

describe('With PetStore example', () => {
  const loader = new noflo.ComponentLoader(process.cwd());
  const def = {
    url: 'https://petstore3.swagger.io/api/v3/openapi.json',
  };
  before((done) => loader.listComponents(done));
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
  });
});
