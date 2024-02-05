/* Librerías */
const express = require('express');
const Limpieza = require(__dirname + "/../models/limpieza.js");
const Habitacion = require(__dirname + "/../models/habitacion.js");

const router = express.Router();

let autenticacion = (req, res, next) => {
  if (req.session && req.session.usuario)
      return next();
  else
      res.render('login');
};

router.get('/:id', (req, res) => {
  let idHabitacion = req.params.id;

  Limpieza.find({ idHabitacion: idHabitacion }).sort({ fechaHora: 1 })
    .then((resultado) => {
      res.render('limpiezas_listado', { limpiezas: resultado, idHabitacion: idHabitacion })
      // if (resultado && resultado.length > 0) {

      // }else{
      //     // res.render('error',{error:"No existen limpiezas"});
      //    }
      // }).catch(error => {
      // res.render('error',{error:"No existen limpiezas"});
    });
});

router.get('/nueva/:id', (req, res) => {
  let idHabitacion = req.params.id;
  let fechaHora = Date.now();
  Habitacion.findById({ _id: idHabitacion }).then(resultado => {
    if (resultado) {
      res.render('limpiezas_nueva', { idHabitacion: idHabitacion, fechaHora: fechaHora })
    }
  }).catch(error => {
    res.render('error', { error: "No existe la habitacion indicada" });
  })

})



router.post('/:id', autenticacion,(req, res) => {
  let idHabitacion = req.params.id;

  Limpieza.find({ idHabitacion: idHabitacion }).then(resultado => {
    if (resultado) {
      let nuevaLimpieza = new Limpieza({
        idHabitacion:idHabitacion,
        fechaHora:req.body.fechaHora,
        observaciones:req.body.observaciones
      });
      nuevaLimpieza.save().then(resul =>{
        res.redirect(`/limpiezas/${idHabitacion}`);
      })
    }
  }).catch(error => {
    res.render('error',
      { error: "Error añadiendo limpieza" });
  });
})

module.exports = router;

