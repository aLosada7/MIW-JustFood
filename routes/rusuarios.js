module.exports = function(app,swig,gestorBD) {

    app.get("/usuarios", function(req, res) {
        res.send("ver usuarios");
    });

    app.get("/index", function(req, res) {
        var respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.post("/identificarse", function(req, res) {
        var seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        var criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/index" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");
            } else {
                req.session.usuario = usuarios[0].email;
                console.log(usuarios[0].tipoUsuario);
                if(usuarios[0].tipoUsuario=="Cliente")
                    res.redirect("/tienda");
                else
                    res.redirect("/publicaciones");
            }

        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/index");
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
                email : req.body.email,
                password : seguro,
                tipoUsuario : req.params.tipoUsuario
            }
        }else if(req.params.tipoUsuario == "Restaurante"){
            usuario = {
                email : req.body.email,
                password : seguro,
                tipoUsuario : req.params.tipoUsuario,
                name : req.body.name,
                speciality: req.body.speciality,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
                city: req.body.city
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
                                res.redirect("/index?mensaje=Nuevo usuario registrado");
                            }
                        });
                    }
                }else{
                    res.redirect("/index?mensaje=Nuevo usuario registrado");
                }
            }
        });


    })

};
