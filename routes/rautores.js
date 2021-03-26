module.exports = function(app, swig) {
    app.get('/autores', function (req,res){
        let autores = [{
            "nombre" : "Tobias Forge",
            "grupo" : "Ghost",
            "rol" : "cantante"
        },{
            "nombre" : "Daniel Avidan",
            "grupo" : "NSP",
            "rol" : "cantante"
        },{
            "nombre" : "Paolo Gregoletto",
            "grupo" : "Trivium",
            "rol" : "bajista"
        }];

        let respuesta = swig.renderFile('views/autores.html',{
            autores : autores
        });

        res.send(respuesta);
    });



    app.get("/autores/agregar", function(req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {

        });
        res.send(respuesta);
    });

    app.post('/autor', function(req, res) {
        let name = req.body.nombre;
        let group = req.body.grupo;

        if(typeof(req.body.nombre) == "undefined")
            name = "Nombre no enviado en la petición";
        if(typeof(req.body.grupo) == "undefined")
            name = "Grupo no enviado en la petición";

        res.send("Autor agregado:"+name+ '<br>'
            +"Grupo:"+group+ '<br>'
            +"Rol:"+req.body.rol);
    });

    app.get("/aut*", function(req, res) {
        res.redirect("/autores");
    });

};