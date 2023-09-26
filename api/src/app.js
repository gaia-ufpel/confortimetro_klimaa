const express = require('express');

const app = express();

const logger = (request, response, next) => {
    const method = request.method;
    const url = request.url;
    const time = new Date().getFullYear();
    console.log(method, url, time);
    
    next();
};

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

app.get('/api/v1/', (request, response) => {

})

module.exports = app;