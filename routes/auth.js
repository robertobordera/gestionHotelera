const express = require("express");
const Usuario = require(__dirname + "/../models/usuario.js");

let router = express.Router();

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', (req, res) => {
    let login = req.body.login;
    let password = req.body.password;

    Usuario.findOne({login:login}).then(usuario =>{
        if(!usuario){
            return res.redirect('/auth/login');
        }
        if(usuario.password == password){
            req.session.usuario = usuario.login
            return res.redirect('/habitaciones');
        }
        else{
            return res.redirect('/auth/login');
        }
        
    }).catch(error => {
        console.error("Error en la consulta a la base de datos:", error);
        return res.render('login', { error: "Error de autenticación" });
      });
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;