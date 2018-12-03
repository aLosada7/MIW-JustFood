// Módulos
var express = require('express');
var app = express();

var mongo = require('mongodb');
var swig  = require('swig');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

// Variables
app.set('port', 8081);
app.set('db','mongodb://admin2018:admin2018@ds145223.mlab.com:45223/tiendamusica');

//Rutas/controladores por logica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rcanciones.js")(app, swig, gestorBD);


// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
})

//mongodb://admin2018:admin2018@ds145223.mlab.com:45223/tiendamusica