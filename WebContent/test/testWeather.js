const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); // Ensure this path points to your main app file
const expect = chai.expect;

chai.use(chaiHttp);

describe('Weather API Endpoints', () => {
  describe('POST /weather/getWeatherByCity', () => {
    it('should return weather data for a valid city name', (done) => {
      const requestBody = {
        cityName: 'New York', // Use a well-known city name to ensure the external API can return data
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
          // Additional assertions can be made based on the structure of your weather data
          done();
        });
    });

    it('should return an error for an invalid city name', (done) => {
      const requestBody = {
        cityName: 'InvalidCityName123', // Use an invalid city name to test error handling
      };

      chai.request(app)
        .post('/weather/getWeatherByCity')
        .send(requestBody)
        .end((err, res) => {
          expect(res).to.have.status(500); // Assuming your API returns a 500 error for this case
          expect(res.body).to.be.an('object');
          expect(res.text).to.equal('City not found'); // Expecting the error message returned by the server
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
            expect(res).to.have.status(400); // Assuming your API returns a 400 for invalid input
            expect(res.body).to.be.an('object');
            expect(res.body.error).to.contain("No forecast data available");
            done();
          });
      });
    });
  });
  describe('Query Weather Data by City', () => {
    describe('GET /weather/queryWeatherByCity', () => {
      it('should return weather data for a city', (done) => {
        const cityName = 'London';
        // Make sure London or your test city's data is in your test database
        chai.request(app)
          .get(`/weather/queryWeatherByCity?cityName=${cityName}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            // Expect at least one result if your test data includes London
            expect(res.body.length).to.be.greaterThan(0);
            // Verify structure of the returned weather data
            expect(res.body[0]).to.have.all.keys('city', 'forecast_date', 'temperature', 'weather_description');
            done();
          });
      });
  
      it('should return an empty array for a city with no data', (done) => {
        const cityName = 'NoDataCity';
        chai.request(app)
          .get(`/weather/queryWeatherByCity?cityName=${cityName}`)
          .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(0); // No data for the city
            done();
          });
      });
    });
  });
  
});
