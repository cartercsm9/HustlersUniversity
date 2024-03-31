const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const expect = chai.expect;

const { getCityName } = require('../public/getCurrentLocation.js'); // Adjust the path as needed

describe('getCityName Function', function() {
    this.timeout(10000);
    let axiosGetStub;

    beforeEach(() => {
        axiosGetStub = sinon.stub(axios, 'get');
    });

    afterEach(() => {
        axiosGetStub.restore();
    });

    it('should resolve with "Kelowna" on successful API response', async () => {
        const mockApiResponse = {
            data: {
                address: {
                    city: 'Kelowna'
                }
            }
        };

        axiosGetStub.resolves(mockApiResponse);

        const cityName = await getCityName(49.8863, -119.4966);

        expect(cityName).to.equal('Kelowna');
    });

    it('should log an error when the city name is not found in the data', async () => {
        axiosGetStub.resolves({ data: {} });

        try {
            await getCityName(123, 456);
            throw new Error('Expected error to be thrown');
        } catch (error) {
            expect(error.message).to.equal('City name not found in the data');
        }
    });
});
