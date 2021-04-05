module.exports = function(app, swig, gestorBD) {
    app.post("/comentarios/:cancion_id", function(req, res) {
        var usuario = req.session.usuario;

        if(usuario == null){
            res.send("Error usuario no autentificado");
            return;
        }

        let comentario = {
            autor: usuario,
            texto : req.body.comentario,
            cancion_id : gestorBD.mongo.ObjectID(req.params.cancion_id)
        }

        gestorBD.insertarComentario(comentario, function(id){
            if (id == null) {
                res.send("Error al insertar comentario");
            } else {
                res.send("Agregado comentario: "+ id);
            }
        });
    });
};

