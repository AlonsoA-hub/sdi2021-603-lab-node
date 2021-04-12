module.exports = function(app, swig, gestorBD) {
    app.post("/comentarios/:cancion_id", function(req, res) {
        var usuario = req.session.usuario;

        if(usuario == null){
            let respuesta = swig.renderFile('views/error.html',{
                texto : 'Error usuario no identificado.'
            });
            res.send(respuesta);
            return;
        }

        let comentario = {
            autor: usuario,
            texto : req.body.comentario,
            cancion_id : gestorBD.mongo.ObjectID(req.params.cancion_id)
        }

        gestorBD.insertarComentario(comentario, function(id){
            if (id == null) {
                let respuesta = swig.renderFile('views/error.html',{
                    texto : 'Error al insertar comentario.'
                });
                res.send(respuesta);
            } else {
                res.send("Agregado comentario: "+ id);
            }
        });
    });

    app.get("/comentario/eliminar/:id", function (req,res){
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        var usuario = req.session.usuario;

        if(usuario == null){
            let respuesta = swig.renderFile('views/error.html',{
                texto : 'Error usuario no identificado.'
            });
            res.send(respuesta);
            return;
        }

        gestorBD.obtenerComentarios(criterio, function (comentario){
            if ( usuario != comentario[0].autor ){
                res.send("No se pueden borrar comentarios ajenos");
            } else {
                gestorBD.eliminarComentario(comentario[0], function (aux){
                    if(aux == null){
                        let respuesta = swig.renderFile('views/error.html',{
                            texto : 'Error al borrar comentario.'
                        });
                        res.send(respuesta);
                    } else {
                        res.redirect("/tienda");
                    }
                })
            }
        })

    });
};

