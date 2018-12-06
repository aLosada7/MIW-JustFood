module.exports = function(app,swig,gestorBD) {

    app.get("/canciones", function(req, res) {

        var canciones = [ {
            "nombre" : "Blank space",
            "precio" : "1.2"
        }, {
            "nombre" : "See you again",
            "precio" : "1.3"
        }, {
            "nombre" : "Uptown Funk",
            "precio" : "1.1"
        } ];

        var respuesta = swig.renderFile('views/btienda.html', {
            vendedor : 'Tienda de canciones',
            canciones : canciones
        });

        res.send(respuesta);

    });

    app.get('/menus/agregar', function (req, res) {
        var respuesta = swig.renderFile('views/bagregar.html', {

        });
        res.send(respuesta);
    })

    app.post("/menu", function(req, res) {

        //console.log("aqui");

        var menu = {
            nombre : req.body.nombre,
            primerPlato : req.body.primerPlato,
            segundoPlato : req.body.segundoPlato,
            tercerPlato: req.body.tercerPlato,
            postre: req.body.postre,
            precio: req.body.precio,
            restaurante: req.session.usuario
        }


        // Conectarse
        gestorBD.insertarMenu(menu, function(id) {
            if (id == null) {
                res.send("Error al insertar ");
            } else {
                res.redirect("/publicaciones+\n" +
                    "                    \"?mensaje=Menú añadido correctamente\"+\n" +
                    "                    \"&tipoMensaje=alert-success \"");
            }
        });

    });

    app.get("/tienda", function(req, res) {
        var criterio = {"tipoUsuario": "Restaurante"};

        if( req.query.busqueda != null ){
            criterio = { "name" : req.query.busqueda};
        }

        var pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerRestaurantesPg(criterio, pg , function(restaurantes, total ) {
            if (restaurantes == null) {
                res.send("Error al listar ");
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

    app.get("/publicaciones", function(req, res) {
        var criterio = { "restaurante" : req.session.usuario };

        gestorBD.obtenerMenu(criterio, function(menus) {
            console.log(menus);
            if (menus == null) {
                res.send("Error al listar ");
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
                        res.send(respuesta);
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
                res.send(respuesta);
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
                res.send(respuesta);
            } else {
                res.redirect("/publicaciones"+
                    "?mensaje=Menú eliminado correctamente"+
                    "&tipoMensaje=alert-success ");
            }
        });
    })

    app.get('/cancion/comprar/:id', function (req, res) {
        var cancionId = gestorBD.mongo.ObjectID(req.params.id);
        var compra = {
            usuario : req.session.usuario,
            cancionId : cancionId
        }

        gestorBD.insertarCompra(compra ,function(idCompra){
            if ( idCompra == null ){
                res.send(respuesta);
            } else {
                res.redirect("/compras");
            }
        });
    })

    app.get('/compras', function (req, res) {
        var criterio = { "usuario" : req.session.usuario };

        gestorBD.obtenerCompras(criterio ,function(compras){
            if (compras == null) {
                res.send("Error al listar ");
            } else {

                var cancionesCompradasIds = [];
                for(i=0; i <  compras.length; i++){
                    cancionesCompradasIds.push( compras[i].cancionId );
                }

                var criterio = { "_id" : { $in: cancionesCompradasIds } }
                gestorBD.obtenerCanciones(criterio ,function(canciones){
                    var respuesta = swig.renderFile('views/bcompras.html',
                        {
                            canciones : canciones
                        });
                    res.send(respuesta);
                });
            }
        });
    })

    app.post('/menu/modificar/:id', function (req, res) {
        console.log("aqui");
        var id = req.params.id;
        var criterio = { "_id" : gestorBD.mongo.ObjectID(id)  };

        var menu = {
            nombre : req.body.nombre,
            primerPlato : req.body.primerPlato,
            segundoPlato : req.body.segundoPlato,
            tercerPlato: req.body.tercerPlato,
            postre: req.body.postre,
            precio: req.body.precio,
            restaurante: req.session.usuario
        }

        gestorBD.modificarMenu(criterio, menu, function(result) {
            if (result == null) {
                res.send("Error al modificar ");
            } else {
                    if( result == null){
                        res.send("Error en la modificación");
                    } else {
                        res.redirect("/publicaciones"+
                            "?mensaje=Menú modificado correctamente"+
                            "&tipoMensaje=alert-success ");
                    }
            }
        });

    })

    function paso1ModificarPortada(files, id, callback){
        if (files.portada != null) {
            var imagen =files.portada;
            imagen.mv('public/portadas/' + id + '.png', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    paso2ModificarAudio(files, id, callback); // SIGUIENTE
                }
            });
        } else {
            paso2ModificarAudio(files, id, callback); // SIGUIENTE
        }
    }

    function paso2ModificarAudio(files, id, callback){
        if (files.audio != null) {
            var audio = files.audio;
            audio.mv('public/audios/'+id+'.mp3', function(err) {
                if (err) {
                    callback(null); // ERROR
                } else {
                    callback(true); // FIN
                }
            });
        } else {
            callback(true); // FIN
        }
    }



    //----------------------------

    app.get('/canciones/:id', function(req, res) {
        var respuesta = 'id: ' + req.params.id;
        res.send(respuesta);
    })

    app.get('/canciones/:genero/:id', function(req, res) {
        var respuesta = 'id: ' + req.params.id + '<br>'
            + 'Genero: ' + req.params.genero;

        res.send(respuesta);
    })




};
