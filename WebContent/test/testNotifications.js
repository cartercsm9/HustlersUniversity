const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;
const sgMail = require('@sendgrid/mail');

describe('Email Sending', () => {
  let sendStub;
  let consoleLogStub;
  let consoleErrorStub;

  beforeEach(() => {
    // Create a stub for the sgMail.send function
    sendStub = sinon.stub(sgMail, 'send');

    // Create stubs for console.log and console.error
    consoleLogStub = sinon.stub(console, 'log');
    consoleErrorStub = sinon.stub(console, 'error');
  });

  afterEach(() => {
    // Restore the original functions after each test
    sendStub.restore();
    consoleLogStub.restore();
    consoleErrorStub.restore();
  });

  function sendEmail() {
    const msg = {
      to: 'kkhejazin@gmail.com',
      from: 'codeCrafters420@gmail.com',
      subject: 'Sending with SendGrid is Fun',
      text: 'and easy to do anywhere, even with Node.js',
      html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };

    return sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  it('should send an email successfully', async () => {
    // Setup the send stub to resolve
    sendStub.resolves();

    // Call the function to test
    await sendEmail();

    // Assert that console.log was called with the expected message
    expect(consoleLogStub.calledWith('Email sent')).to.be.true;
  });

  it('should handle failed email sending', async () => {
    // Setup the send stub to reject with an error
    const error = new Error('Email sending failed');
    sendStub.rejects(error);
  
    // Call the function to test
    await sendEmail();
  
    // Assert that console.error was called
    expect(consoleErrorStub.calledOnce).to.be.true;
  });
  
});
