module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });

    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones[0]) );
            }
        });
    });

    app.delete("/api/cancion/:id", function(req, res) {
        if (req.params.id == null) {
            res.status(500);
            res.json({
                error : "se ha producido un error"
            });
        }

        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)}

        usuarioEsAutor(req.session.usuario,req.params.id, function (esAutor){
            if(!esAutor){
                res.status(500);
                res.json({
                    error : "Usuario no es el autor de la cancion"
                })
            } else {
                gestorBD.eliminarCancion(criterio,function(canciones){
                    if ( canciones == null ){
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else if(canciones.autor) {

                    } else {
                        res.status(200);
                        res.send( JSON.stringify(canciones) );
                    }
                });
            }
        })


    });

    app.post("/api/cancion", function(req, res) {
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
        }
        // ¿Validar nombre, genero, precio?

        validarCancion(cancion, function (errors){
            if(errors != null && errors.length > 0){
                res.status(500);
                res.json({
                    error : errors
                })
            } else {
                gestorBD.insertarCancion(cancion, function(id){
                    if (id == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje : "canción insertada",
                            _id : id
                        })
                    }
                });
            }
        })
    });

    app.put("/api/cancion/:id", function(req, res) {

        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        let cancion = {}; // Solo los atributos a modificar

        validarCancion(cancion, function (errors){
            if(errors != null && errors.length > 0){
                res.status(500);
                res.json({
                    error : errors
                })
            } else {
                if ( req.body.nombre != null)
                    cancion.nombre = req.body.nombre;
                if ( req.body.genero != null)
                    cancion.genero = req.body.genero;
                if ( req.body.precio != null)
                    cancion.precio = req.body.precio;
                gestorBD.modificarCancion(criterio, cancion, function(result) {
                    if (result == null) {
                        res.status(500);
                        res.json({
                            error : "se ha producido un error"
                        })
                    } else {
                        res.status(200);
                        res.json({
                            mensaje : "canción modificada",
                            _id : req.params.id
                        })
                    }
                });
            }
        })


    });

    app.post("/api/autenticar", function(req, res) {

        let seguro = app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio,function (usuarios){
            if(usuarios == null || usuarios.length == 0){
                res.status(401);
                res.json({
                    autenticado : false
                });
            } else {
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    autenticado : true,
                    token : token
                });
            }
        });
    });

    function validarCancion(cancion, callback){
        var errors = new Array();
        if(cancion.nombre.length < 5 || cancion.nombre.length > 30){
            errors.push("El nombre tiene que tener entre 5 y 30 caracteres");
        }
        if(cancion.precio < 0) {
            errors.push("El precio tiene que ser mayor que 0");
        }
        if(cancion.genero.length < 5 || cancion.genero.length > 30) {
            errors.push("El genero tiene que ser mayor que 0");
        }

        if(errors.length > 0)
            callback(errors);
        else
            callback(null);
    }

    function usuarioEsAutor(usuario, cancionId, functionCallback){
        let criterio_ser_autor = {$and: [{"_id" : cancionId}, {"autor" : usuario}]};

        gestorBD.obtenerCanciones(criterio_ser_autor, function (canciones){
            if(canciones == null || canciones.length > 0){
                functionCallback(false);
            } else {
                functionCallback(true);
            }
        });
    }
}