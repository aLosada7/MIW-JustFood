// Módulos
var express = require('express');
var app = express();

//var fs = require('fs');
//var https = require('https');
var expressSession = require('express-session');
app.use(expressSession({//interesante cuanto tiempo tarda en expirar la sesión
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
var crypto = require('crypto');
var fileUpload = require('express-fileupload');
app.use(fileUpload());
var mongo = require('mongodb');
var swig  = require('swig');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);

var expressSanitizer = require('express-sanitizer');
app.use(expressSanitizer());

//Routers:
// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("Router usuario")
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        res.redirect("/login");
    }
});

app.use(express.static('public'));

//Aplicar routerUsuarioSession
app.use("/restaurante/comprar",routerUsuarioSession);
app.use("/pedidos",routerUsuarioSession);

//routerUsuarioRestaurante
var routerUsuarioRestaurante = express.Router();
routerUsuarioRestaurante.use(function(req, res, next) {
    console.log("Router Restaurant")
    if(req.session.usuario != null) {
        gestorBD.obtenerUsuarios(
            { email : req.session.usuario }, function (usuarios) {
                console.log(usuarios)
                if(usuarios[0].tipoUsuario == "Restaurante"){
                    next();
                } else {
                    res.redirect("/restaurantes?mensaje=Solamente los restaurante tienen acceso a este área");
                }
            })
    } else {
        res.redirect("/login")
    }

});

//Aplicar routerUsuarioAutor
app.use("/menus", routerUsuarioRestaurante);

//routerUsuarioAutor
var routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {

    console.log("Router autor")

    var path = require('path');
    var id = path.basename(req.originalUrl);
    // Cuidado porque req.params no funciona
    // en el router si los params van en la URL.

    gestorBD.obtenerMenu(
        { _id : mongo.ObjectID(id) }, function (menus) {
            if(menus[0].restaurante == req.session.usuario ){
                next();
            } else {
                res.redirect("/menus");
            }
        })

});

//Aplicar routerUsuarioAutor
app.use("/menu/modificar",routerUsuarioAutor);
app.use("/menu/eliminar",routerUsuarioAutor);


// Variables
app.set('port', process.env.PORT || 8088);
app.set('db','mongodb://admin2018:admin2018@ds223063.mlab.com:23063/justfood');
app.set('clave','9bBmJOP3yGfo1QB1LtSO');
app.set('crypto',crypto);

//Rutas/controladores por logica
require("./routes/rusuarios.js")(app, swig, gestorBD);
require("./routes/rrestaurantes.js")(app, swig, gestorBD);


app.get('/', function (req, res) {
    res.redirect('/login');
});

app.use( function (err, req, res, next ) {
    console.log("Error producido: " + err); //we log the error in our db
    if (! res.headersSent) {
        res.status(400);
        res.send("Recurso no disponible");
    }
});

// lanzar el servidor
app.listen(app.get('port'), function() {
    console.log("Servidor activo");
});
