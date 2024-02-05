const mongoose = require('mongoose');
const express = require("express");
const nunjucks = require('nunjucks');
const dateFilter = require('nunjucks-date-filter');
const methodOverride = require('method-override');
const session = require('express-session');

const habitaciones = require(__dirname + '/routes/habitaciones.js');
const limpiezas = require(__dirname +'/routes/limpiezas.js');
const auth = require(__dirname +'/routes/auth.js');

mongoose.connect('mongodb://127.0.0.1:27017/hotel');

const app = express();
app.use(methodOverride('_method'));

const env = new nunjucks.Environment();
 
env.addFilter('date', dateFilter);

dateFilter.setDefaultFormat('DD/MM/YYYY');

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.set('view engine', 'njk');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      let method = req.body._method;
      delete req.body._method;
      return method;
    } 
}));
app.use('/uploads', express.static(__dirname +'/uploads'));
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(session({
    secret: '1234',
    resave: true,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});



app.use('/habitaciones',habitaciones);
app.use('/limpiezas',limpiezas);
app.use('/auth',auth);



app.listen(8080);

