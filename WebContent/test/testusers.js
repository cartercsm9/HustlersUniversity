const chai = require('chai');
const chaiHttp = require('chai-http');
const { query } = require('../database.js');
// Adjust the path as necessary to import your Express app
const app = require('../app.js');

chai.use(chaiHttp);

const expect = chai.expect;

describe('User Authentication', () => {
  describe('/POST /users/signup', () => {
    it('should create a new user', (done) => {
      let user = {
        username: 'testuser124',
        email: 'test13@test.com',
        password: '123456!!!'
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
        username: 'testuser12',
        password: '123456!!!'
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

describe('/POST /users/userPref', () => {
  it('should set user preferences', (done) => {

    const userId = 1 //result[0].id;

    let preferences = {
      userId: userId,
      preferredCity: 'New York',
      temperatureUnit: 'C',
      notifications: true
    };

    chai.request(app)
      .post('/users/userPref')
      .send(preferences)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        expect(res).to.have.status(200);
        // Additional assertions as needed
        done();
      });
  });
});