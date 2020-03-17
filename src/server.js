const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path')

const routes = require('./routes');

const server = express();

mongoose.connect('mongodb+srv://littlegram:senha@cluster0-qtrs8.gcp.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

server.use(cors());
server.use(express.json());
server.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));
server.use(routes);

server.listen(3333);