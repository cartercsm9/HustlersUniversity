import('chai').then(chai => {
  const expect = chai.expect;

  describe('My functionality', function() {
      it('should do something', function() {
          let number = 1;
          expect(number).to.equal(1);
      });
  });
}).catch(error => {
  // Handle error
  console.error("Error occurred while importing chai:", error);
});
