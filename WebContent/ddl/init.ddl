CREATE DATABASE IF NOT EXISTS weatherappdb;
USE weatherappdb;

go

USE weatherApp;
go

DROP TABLE users;
DROP TABLE admins;
DROP TABLE weather_data;
DROP TABLE user_preferences;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE weather_data (
    weather_id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    forecast_date DATE NOT NULL,
    temperature DECIMAL(5, 2) NOT NULL,
    weather_description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE user_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    preferred_city VARCHAR(255),
    temperature_unit CHAR(1) CHECK (temperature_unit IN ('C', 'F')), -- 'C' for Celsius, 'F' for Fahrenheit
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);


CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_admins_username ON admins(username);
CREATE INDEX idx_weather_data_city ON weather_data(city);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
