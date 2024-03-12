function validateSignupForm() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;

    // Validate Username
    var usernamePattern = /^.{4,}$/;
    if (!usernamePattern.test(username)) {
        alert("Username must be atleast 4 characters long.");
        return false;
    }
    
    // Validate Email
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return false;
    }

    // Validate Password
    var passwordPattern = /^(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,}$/;
    if (!passwordPattern.test(password)) {
        alert("Password must include at least one number, at least one special character, and be at least 8 characters long.");
        return false;
    }

    // Validate Password Match
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return false;
    }

    alert("Validation successful.");
    return true;
}
