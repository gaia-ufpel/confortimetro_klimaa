//const express = require('express');
//const bcrypt = require('bcrypt');
import express from 'express';
import bcrypt from 'bcrypt';
import cryptoRandomString from 'crypto-random-string';

const app = express();

const logger = (request, response, next) => {
    const method = request.method;
    const url = request.url;
    const time = new Date().getFullYear();
    console.log(method, url, time);
    
    next();
};

const authenticator = (request, response, next) => {
    
}

app.get('/api', logger, (request, response, next) => {
    response.status(200).json({
        "msg":"Hello world!"
    });
});

app.get('/api/v1', (request, response) => {
    response.status(200).json({
        "msg":"Hello v1"
    });
});

app.get('/api/v1/metrics', authenticator, (request, response) => {
    
});

// sign-in and generate bearer token
app.post('/api/v1/signin', async (request, response) => {
    let username = request.body.username;
    let password = request.body.password;

    // search username and password at database
    let hash = "";

    // compare given passoword and user's hash
    let result = await bcrypt.compare(password, hash);

    if (result === true) {
        let token = cryptoRandomString({length: 32});

        response.status(201).cookie('token', 'Bearer ' + token, {
            expires: new Date(Date.now() + 12 * 3600000),
            httpOnly: true,
            secure: false
        });
    }

    response.status(401);
});

app.get('/api/v1/signup', (request, response) => {

});

module.exports = app;