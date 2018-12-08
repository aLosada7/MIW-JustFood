module.exports = function(app,swig,gestorBD) {

    app.get('/menus/agregar', function (req, res) {
        var respuesta = swig.renderFile('views/bagregar.html', {

        });
        res.send(respuesta);
    })

    app.post("/menu", function(req, res) {

        var menu = {
            nombre : req.sanitize(req.body.nombre),
            primerPlato : req.sanitize(req.body.primerPlato),
            segundoPlato : req.sanitize(req.body.segundoPlato),
            tercerPlato: req.sanitize(req.body.tercerPlato),
            postre: req.sanitize(req.body.postre),
            precio: req.sanitize(req.body.precio),
            restaurante: req.session.usuario
        }


        // Conectarse
        gestorBD.insertarMenu(menu, function(id) {
            if (id == null) {
                res.redirect("/menus" +
                    "?mensaje=Error al dar de alta el nuevo menú"+
                    "&tipoMensaje=alert-danger ");
            } else {
                res.redirect("/menus" +
                    "?mensaje=Menú insertado correctamente"+
                    "&tipoMensaje=alert-succes ");
            }
        });

    });

    app.get("/restaurantes", function(req, res) {
        var criterio = {"tipoUsuario": "Restaurante"};

        if( req.query.busqueda != null ){
            criterio = { "name" : req.query.busqueda};
        }

        if( req.query.ciudad != null && req.query.speciality != null){
            criterio = { "city" : req.query.ciudad,
                        "speciality" : req.query.speciality};
        }

        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerRestaurantesPg(criterio, pg , function(restaurantes, total ) {
            if (restaurantes == null) {
                res.redirect("/restaurantes" +
                    "?mensaje=No hemos podido obtener los restaurantes"+
                    "&tipoMensaje=alert-danger ");
            } else {

                var pgUltima = total/4;
                if (total % 4 > 0 ){ // Sobran decimales
                    pgUltima = pgUltima+1;
                }

                var respuesta = swig.renderFile('views/btienda.html',
                    {
                        restaurantes : restaurantes,
                        pgActual : pg,
                        pgUltima : pgUltima
                    });
                res.send(respuesta);
            }
        });

    });

    app.get("/menus", function(req, res) {
        var criterio = { "restaurante" : req.session.usuario };

        gestorBD.obtenerMenu(criterio, function(menus) {
            if (menus == null) {
                res.redirect("/restaurantes" +
                    "?mensaje=No hemos podido obtener tus menús"+
                    "&tipoMensaje=alert-danger ");
            } else {
                var respuesta = swig.renderFile('views/bpublicaciones.html',
                    {
                        menus : menus
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/restaurante/:id', function (req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)  };

        gestorBD.obtenerRestaurante(criterio,function(restaurante){
            if ( restaurante == null ){
                res.send(respuesta);
            } else {
                criterio = { "restaurante" : restaurante[0].email };
                gestorBD.obtenerMenu(criterio,function(menus){
                    if ( menus == null ){
                        res.redirect("/restaurantes" +
                            "?mensaje=Se ha producido un error al obtener los datos del restaurante"+
                            "&tipoMensaje=alert-danger ");
                    } else {
                        var respuesta = swig.renderFile('views/brestaurante.html',
                            {
                                restaurante : restaurante[0],
                                menus: menus
                            });
                        res.send(respuesta);
                    }
                });
            }
        });
    });


    app.get('/menu/modificar/:id', function (req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)  };

        gestorBD.obtenerMenu(criterio,function(menus){
            if ( menus == null ){
                res.redirect("/menus" +
                    "?mensaje=Se ha producido un error al obtener los datos del menú seleccionado"+
                    "&tipoMensaje=alert-danger ");
            } else {
                var respuesta = swig.renderFile('views/bmenuModificar.html',
                    {
                        menu : menus[0]
                    });
                res.send(respuesta);
            }
        });
    })

    app.get('/menu/eliminar/:id', function (req, res) {
        var criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)  };

        gestorBD.eliminarMenu(criterio,function(menus){
            if ( menus == null ){
                res.redirect("/menus" +
                    "?mensaje=Se ha producido un error al obtener los datos del menú seleccionado"+
                    "&tipoMensaje=alert-danger ");
            } else {
                res.redirect("/menus"+
                    "?mensaje=Menú eliminado correctamente"+
                    "&tipoMensaje=alert-success ");
            }
        });
    })

    app.get('/restaurante/comprar/:id', function (req, res) {
        var menuId = gestorBD.mongo.ObjectID(req.params.id);

        gestorBD.obtenerMenu({ _id : gestorBD.mongo.ObjectID(req.params.id) }, function (menus) {
            if(menus == null){
                res.redirect("/restaurantes"+
                    "?mensaje=Se ha producido un error durante la tramitación del pedido"+
                    "&tipoMensaje=alert-danger ");
            } else {
                var criterio = {"email" : menus[0].restaurante}
                gestorBD.obtenerRestaurante(criterio,function(restaurante) {
                    if(restaurante == null) {
                        res.redirect("/restaurantes" +
                            "?mensaje=Se ha producido un error durante la tramitación del pedido" +
                            "&tipoMensaje=alert-danger ");
                    } else {
                        var compra = {
                            usuario : req.session.usuario,
                            restaurante: restaurante[0].name,
                            menu : menus[0].nombre,
                            fecha: (new Date()).toDateString()
                        }

                        gestorBD.insertarCompra(compra ,function(idPedido){
                            if ( idPedido == null ){
                                res.redirect("/restaurantes"+
                                    "?mensaje=Se ha producido un error durante la tramitación del pedido"+
                                    "&tipoMensaje=alert-danger ");
                            } else {
                                res.redirect("/restaurantes"+
                                    "?mensaje=Pedido realizado con éxito"+
                                    "&tipoMensaje=alert-success ");
                            }
                        });
                    }
                });
            }
        });
    })

    app.get('/pedidos', function (req, res) {
        var criterio = { "usuario" : req.session.usuario };

        gestorBD.obtenerPedidos(criterio ,function(pedidos){
            if (pedidos == null) {
                res.send("Error al listar ");
            } else {
                var respuesta = swig.renderFile('views/bcompras.html',
                    {
                    pedidos: pedidos
                    });
                res.send(respuesta);
            }
        });
    })

    app.post('/menu/modificar/:id', function (req, res) {

        var id = req.params.id;
        var criterio = { "_id" : gestorBD.mongo.ObjectID(id)  };

        var menu = {
            nombre : req.sanitize(req.body.nombre),
            primerPlato : req.sanitize(req.body.primerPlato),
            segundoPlato : req.sanitize(req.body.segundoPlato),
            tercerPlato: req.sanitize(req.body.tercerPlato),
            postre: req.sanitize(req.body.postre),
            precio: req.sanitize(req.body.precio),
            restaurante: req.session.usuario
        }

        gestorBD.modificarMenu(criterio, menu, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                    if( result == null){
                        res.redirect("/menus"+
                            "?mensaje=Se ha producido un error al intentar modificar el menú"+
                            "&tipoMensaje=alert-alert ");
                    } else {
                        res.redirect("/menus"+
                            "?mensaje=Menú modificado correctamente"+
                            "&tipoMensaje=alert-success ");
                    }
            }
        });

    })
};
