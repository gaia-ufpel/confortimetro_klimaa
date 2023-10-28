CREATE DATABASE klimaa;

\c klimaa;

CREATE SCHEMA klimaa;

SET search_path TO klimaa;

CREATE TABLE users (
    email VARCHAR(50) NOT NULL PRIMARY KEY,
    password_hash VARCHAR(100) NOT NULL,
    date_create TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE accesses (
    date_access TIMESTAMP WITH TIME ZONE NOT NULL,
    email VARCHAR(50) NOT NULL,
    ip_addr INET NOT NULL,
    device_type VARCHAR(30) NOT NULL,
    PRIMARY KEY (date_access, email),
    FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE sessions (
    session_id VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (session_id),
    FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE api_keys (
    email VARCHAR(50) NOT NULL,
    api_key VARCHAR(100) NOT NULL,
    read_only BOOLEAN NOT NULL DEFAULT true,
    PRIMARY KEY (email, api_key),
    FOREIGN KEY (email) REFERENCES users(email)
);

CREATE TABLE dataloggers (
    id INT NOT NULL,
    model VARCHAR(30) NOT NULL,
    description TEXT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE metrics (
    date_metric TIMESTAMP WITH TIME ZONE NOT NULL,
    datalogger_id INT NOT NULL,
    temperature FLOAT NOT NULL,
    globe_temperature FLOAT NOT NULL,
    atmospheric_pressure FLOAT NOT NULL,
    humidity FLOAT NOT NULL,
    wind_speed FLOAT NOT NULL,
    PRIMARY KEY (date_metric, datalogger_id),
    FOREIGN KEY (datalogger_id) REFERENCES dataloggers(id)
);