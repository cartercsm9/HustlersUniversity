const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;
const proxyquire = require('proxyquire');

// Mock database and other dependencies as needed
const dbMock = {};
const cronMock = {};

const { insertForecastForAllCities } = proxyquire('../routes/weather', {
    '../database.js': dbMock,
    'node-cron': cronMock
});

describe('Forecast Updater', () => {
    let fetchLocationsStub;
    let insertForecastDataStub;

    beforeEach(() => {
        // As these functions are not methods of an object, they should be stubbed in the context where they are used.
        // Assuming these functions are being called within insertForecastForAllCities directly.
        fetchLocationsStub = sinon.stub().resolves([
            { city: 'City1', country: 'Country1' },
            { city: 'City2', country: 'Country2' }
        ]);

        insertForecastDataStub = sinon.stub().resolves();

        // Replace the actual implementations in the module's scope
        proxyquire('../routes/weather', {
            './path/to/fetchLocations': fetchLocationsStub,
            './path/to/insertForecastData': insertForecastDataStub
        });
    });

    afterEach(() => {
        sinon.restore(); // Restore the original functions
    });

    it('should process all locations returned by fetchLocations', async () => {
        await insertForecastForAllCities();

        expect(fetchLocationsStub.calledOnce).to.be.true;
        expect(insertForecastDataStub.callCount).to.equal(2); // Assuming 2 locations are mocked
        fetchLocationsStub.getCall(0).args.forEach((location, index) => {
            expect(insertForecastDataStub.getCall(index).calledWith(location.city)).to.be.true;
        });
    });

    it('should handle and log errors without stopping the batch process', async () => {
        fetchLocationsStub.resolves([
            { city: 'City1', country: 'Country1' },
            { city: 'City2', country: 'Country2' }
        ]);
        insertForecastDataStub.onFirstCall().rejects(new Error('Test Error'));
        insertForecastDataStub.onSecondCall().resolves();

        const consoleErrorStub = sinon.stub(console, 'error');

        await insertForecastForAllCities();

        expect(fetchLocationsStub.calledOnce).to.be.true;
        expect(insertForecastDataStub.calledTwice).to.be.true;
        expect(consoleErrorStub.calledWithMatch('Error inserting forecast for City1')).to.be.true;
    });
});
