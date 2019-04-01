const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');

const adminRoutes = require('./routes/admin');

const shopRoutes = require('./routes/shop');

const app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.use('admin',adminRoutes);

app.use(shopRoutes);

app.use((request, response, next) => {
    response.status(404).sendFile(path.join(__dirname, 'views', 'page-not-found.html'))
});

const server = http.createServer(app);

server.listen(3000);