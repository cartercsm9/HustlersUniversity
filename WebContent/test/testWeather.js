const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Ensure this path points to your main app file
const expect = chai.expect;

chai.use(chaiHttp);

describe('Weather API Endpoints', () => {
  describe('POST /weather/getWeatherByCity', () => {
    it('should return weather data for a valid city name', (done) => {
      const requestBody = {
        cityName: 'New York',
      };

      chai.request(app)
        .post('/weather/getWeatherByCity')
        .send(requestBody)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.property('location');
          expect(res.body.location).to.have.property('name');
          expect(res.body.location.name).to.equal('New York');
          done();
        });
    });

    it('should return an error for an invalid city name', (done) => {
      const requestBody = {
        cityName: 'InvalidCityName123',
      };

      chai.request(app)
        .post('/weather/getWeatherByCity')
        .send(requestBody)
        .end((err, res) => {
          expect(res).to.have.status(500);
          expect(res.body).to.be.an('object');
          expect(res.text).to.equal('City not found');
          done();
        });
    });
  });

  describe('Weather Forecast Insertion', () => {
    describe('POST /weather/insertForecast', () => {
      it('should insert forecast data for a valid city name', (done) => {
        const requestBody = {
          cityName: 'London', // Choose a city known to have weather data available
        };
  
        chai.request(app)
          .post('/weather/insertForecast')
          .send(requestBody)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body.message).to.equal("Weather data inserted successfully.");
            // You might also want to query the database here to verify that data was indeed inserted
            done();
          });
      });
  
      // Example test for error handling
      it('should return an error for an invalid city name', (done) => {
        const requestBody = {
          cityName: 'FakeCity123', // An invalid city name
        };
  
        chai.request(app)
          .post('/weather/insertForecast')
          .send(requestBody)
          .end((err, res) => {
            expect(res).to.have.status(500);
            expect(res.body).to.be.an('object');
            expect(res.body.error).to.contain("No forecast data available");
            done();
          });
      });
    });
  });
  describe('Query Weather Data by City', () => {
    describe('GET /weather/queryWeatherByCity', () => {
      it('should return weather data for a city', function(done) {
        this.timeout(10000);
        const cityName = 'London';
        const timezoneOffset = new Date().getTimezoneOffset(); // or the expected offset in your test data
        chai.request(app)
          .get(`/weather/queryWeatherByCity?cityName=${cityName}&timezoneOffset=${timezoneOffset}`)
          .end((err, res) => {
            if (err) {
              done(err);
              return;
            }
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.greaterThan(0);
            done();
          });
      });
      
      it('should return an empty array for a city with no data', function(done) {
        this.timeout(10000); // Adjust the timeout based on the expected response time
        const cityName = 'NoDataCity';
        // Assuming that the timezoneOffset is needed as per your application logic, you should pass it if required
        const timezoneOffset = new Date().getTimezoneOffset(); // Adjust if you have a specific timezone offset in your test data
    
        chai.request(app)
          .get(`/weather/queryWeatherByCity?cityName=${cityName}&timezoneOffset=${timezoneOffset}`)
          .end((err, res) => {
            if (err) {
              done(err);
              return;
            }
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(0); // Expecting no data for the city
            done();
          });
      });
    });
  });
});
