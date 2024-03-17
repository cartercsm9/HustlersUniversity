const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Adjust the path as necessary to import your Express app
const expect = chai.expect;

chai.use(chaiHttp);

describe('User Authentication', () => {
  describe('/POST /users/signup', () => {
    it('should create a new user', (done) => {
      let user = {
        username: 'testuser1',
        email: 'test1@test.com',
        password: '123456!!'
      };
      chai.request(app)
        .post('/users/signup')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.a('object');
          // Further assertions as needed
          done();
        });
    });
  });

  describe('/POST /users/login', () => {
    it('should authenticate an existing user', (done) => {
      let user = {
        username: 'testuser1',
        password: '123456!!'
      };
      chai.request(app)
        .post('/users/login')
        .send(user)
        .end((err, res) => {
          expect(res).to.have.status(200);
          // Check for redirect to home or a session token, etc.
          // This depends on how your login mechanism is designed to respond
          done();
        });
    });
  });
});
