const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const http = require('http');

const adminData = require('./routes/admin');

const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin',adminData.routes);

app.use(shopRoutes);

app.use((request, response, next) => {
    response.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
});

const server = http.createServer(app);

server.listen(3000);