const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const forecastUpdater = require('../routes/weather'); 

describe('Forecast Updater', () => {
    let fetchLocationsStub;
    let insertForecastDataStub;

    // Assuming fetchLocations and insertForecastData are methods of forecastUpdater
    beforeEach(() => {
        fetchLocationsStub = sinon.stub(forecastUpdater, 'fetchLocations');
        insertForecastDataStub = sinon.stub(forecastUpdater, 'insertForecastData');
    });

    afterEach(() => {
        sinon.restore(); // Restore the original functions
    });

    it('should process all locations returned by fetchLocations', async () => {
        const mockLocations = [
            { city: 'City1', country: 'Country1' },
            { city: 'City2', country: 'Country2' }
        ];

        fetchLocationsStub.resolves(mockLocations);
        insertForecastDataStub.resolves(); // Simulate successful insertion

        await forecastUpdater.insertForecastForAllCities();

        expect(fetchLocationsStub.calledOnce).to.be.true;
        expect(insertForecastDataStub.callCount).to.equal(mockLocations.length);
        mockLocations.forEach(location => {
            expect(insertForecastDataStub.calledWith(location.city)).to.be.true;
        });
    });

    it('should handle and log errors without stopping the batch process', async () => {
        const mockLocations = [
            { city: 'City1', country: 'Country1' },
            { city: 'City2', country: 'Country2' }
        ];

        fetchLocationsStub.resolves(mockLocations);
        insertForecastDataStub.onFirstCall().rejects(new Error('Test Error'));
        insertForecastDataStub.onSecondCall().resolves(); // Simulate successful insertion after a failure

        const consoleErrorStub = sinon.stub(console, 'error');

        await forecastUpdater.insertForecastForAllCities();

        expect(fetchLocationsStub.calledOnce).to.be.true;
        expect(insertForecastDataStub.calledTwice).to.be.true;
        expect(consoleErrorStub.calledOnce).to.be.true;
        expect(consoleErrorStub.firstCall.args[0]).to.include('Error inserting forecast for City1');
    });
});
