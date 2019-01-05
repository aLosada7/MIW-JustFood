module.exports = function(app,swig,gestorBD, moment) {

    app.get("/usuarios", function(req, res) {
        res.send("ver usuarios");
    });

    app.get('/pedidos', function (req, res) {
        var criterio = { "usuario" : req.session.usuario };

        gestorBD.obtenerPedidos(criterio ,function(pedidos){

            if (pedidos == null) {
                res.redirect("/restaurantes" +
                    "?mensaje=Se ha producido un error al intentar recuperar sus pedidos."+
                    "&tipoMensaje=alert-danger ");
            } else {

                pedidos.forEach(p => {
                    p.fecha = moment(p.fecha).locale("es").calendar();
                })

                var respuesta = swig.renderFile('views/bcompras.html',
                    {
                        pedidos: pedidos
                    });
                res.send(respuesta);
            }
        });
    });

    app.get("/login", function(req, res) {
        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.post("/identificarse", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        var criterio = {
            email : req.sanitize(req.body.email),
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/login" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                console.log(usuarios[0].tipoUsuario);
                if(usuarios[0].tipoUsuario=="Cliente")
                    res.redirect("/restaurantes");
                else
                    res.redirect("/menus");
            }

        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.get("/registrarse", function(req, res) {
        var respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

    app.get("/registrarseUsuario", function(req, res) {
        var respuesta = swig.renderFile('views/bregistroUsuario.html', {});
        res.send(respuesta);
    });

    app.get("/registrarseRestaurante", function(req, res) {
        var respuesta = swig.renderFile('views/bregistroRestaurante.html', {});
        res.send(respuesta);
    });

    //registrar usuario
    app.post('/usuario/:tipoUsuario', function(req, res) {

        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        var usuario;

        console.log(req.params.tipoUsuario);
        if(req.params.tipoUsuario == "Cliente"){
            usuario = {
                email : req.sanitize(req.body.email),
                password : seguro,
                tipoUsuario : req.params.tipoUsuario
            }
        }else if(req.params.tipoUsuario == "Restaurante"){
            usuario = {
                email : req.sanitize(req.body.email),
                password : seguro,
                tipoUsuario : req.params.tipoUsuario,
                name : req.sanitize(req.body.name),
                speciality: req.sanitize(req.body.speciality),
                phoneNumber: req.sanitize(req.body.phoneNumber),
                address: req.sanitize(req.body.address),
                city: req.sanitize(req.body.city)
            }
        }

        gestorBD.insertarUsuario(usuario, function(id) {
            if (id == null){
                res.redirect("/registrarse?mensaje=Error al registrar usuario")
            } else {
                if(req.params.tipoUsuario=="Restaurante") {
                    if (req.files.image != null) {
                        var imagen = req.files.image;
                        imagen.mv('public/imgRestaurantes/' + id + '.png', function (err) {
                            if (err) {
                                res.send("Error al subir la imagen");
                            } else {
                                res.redirect("/login?mensaje=Nuevo usuario registrado");
                            }
                        });
                    }
                }else{
                    res.redirect("/login?mensaje=Nuevo usuario registrado");
                }
            }
        });
    })

};
