const express = require('express');

const server = express();

server.get('/', function (request, response) {
    response.send('teste');
});

server.listen(3333);