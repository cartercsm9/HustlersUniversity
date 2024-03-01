function validateLoginForm() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    // Validate Username
    var usernamePattern = /^[a-zA-Z0-9]{4,20}$/;
    if (!usernamePattern.test(username)) {
        alert("Username must be 4-20 characters long and can only contain alphanumeric characters.");
        return false;
    }

    // Validate Password
    var passwordPattern = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$/;
    if (!passwordPattern.test(password)) {
        alert("Password must be at least 8 characters long and include both letters and numbers.");
        return false;
    }

    alert("Validation successful.");
    return true;
}