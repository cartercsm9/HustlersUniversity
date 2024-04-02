// Attach click event listener to the button
document.getElementById('sendButton').addEventListener('click', sendEmailNotification);

function sendEmailNotification() {
  fetch('/notifications/sendEmail')
    .then(response => {
      if (response.ok) {
        console.log('Email notification sent successfully!');
      } else {
        console.error('Failed to send email notification');
      }
    })
    .catch(error => console.error('Error:', error));
}
