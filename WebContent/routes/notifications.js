const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let userEmail; // Declare userEmail outside the function

function setUserEmail(email) {
  userEmail = email;
}

function sendEmail() {
  const msg = {
    to: userEmail,
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

module.exports = (req, res, next) => {
  req.notifications = {
    setUserEmail,
    sendEmail
  };
  next();
};
