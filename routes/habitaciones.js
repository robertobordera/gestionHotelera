/* Librerías */
const express = require("express");
const Habitacion = require(__dirname + "/../models/habitacion.js");
const Limpieza = require(__dirname + "/../models/limpieza.js");
const upload = require(__dirname + '/../utils/uploads.js');
const newUpload = require(__dirname + '/../utils/uploadsIncidencias.js');

let router = express.Router();

let autenticacion = (req, res, next) => {
  if (req.session && req.session.usuario)
    return next();
  else
    res.render('login');
};

router.get('/', (req, res) => {
  Habitacion.find().then((resultado) => {
    if (resultado) {
      res.render('habitaciones_listado', { habitaciones: resultado });
    } else {
      res.render('error', { error: "No existe la habitacion indicada" });
    }
  }).catch(error => {
    res.render('error', { error: "No existe la habitacion indicada" });
  });
});

router.get('/nuevo', (req, res) => {
  res.render('habitaciones_nueva')
})

router.get('/:id', (req, res) => {
  Habitacion.findById(req.params.id).then(resultado => {
    if (resultado) {
      res.render('habitaciones_ficha', { habitacion: resultado });
    } else {
      res.render('error', { error: "No existe la habitacion indicada" });
    }
  }).catch(error => {
    res.render('error', { error: "No existe la habitacion indicada" });
  });
});


/* Insertar una habitación */
router.post('/', autenticacion, upload.upload.single('imagen'), (req, res) => {
  let nuevaHabitacion = new Habitacion({
    numero: req.body.numero,
    tipo: req.body.tipo,
    descripcion: req.body.descripcion,
    precio: req.body.precio

  });
  if (req.file)
    nuevaHabitacion.imagen = req.file.filename;

  nuevaHabitacion.save().then(resultado => {
    res.redirect(req.baseUrl);
  }).catch(error => {
    let errores = {
      general: 'Error insertando habitacion'
    };
    if (error.errors.numero) {
      errores.numero = "El numero de habitacion no puede exceder 100 ";
    }
    if (error.errors.descripcion) {
      errores.descripcion = "Es necesario indicar una descripcion de la habitacion";
    }
    if (error.errors.precio) {
      errores.precio = "El precio maximo no puede exceder 300";
    }

    res.render('habitaciones_nueva', { errores: errores, datos: req.body });
  });
});




/* Eliminar una habitación */
router.delete('/:id', autenticacion, (req, res) => {
  // Borrar la habitación
  Habitacion.findByIdAndDelete(req.params.id)
    .then(resultadoHabitacion => {
      // Si la habitación existía
      if (resultadoHabitacion) {
        // Borrar las limpiezas asociadas a esa habitación
        Limpieza.deleteMany({ idHabitacion: resultadoHabitacion._id })
          .then(() => {
            // Redirigir al listado de habitaciones
            res.redirect(req.baseUrl);
          })
          .catch(errorLimpiezas => {
            // Manejar errores al borrar las limpiezas
            res.render('error', { error: "Error borrando limpiezas de la habitación" });
          });
      } else {
        // Si no se encuentra la habitación, renderizar página de error
        res.render('error', { error: "Habitación no encontrada" });
      }
    })
    .catch(errorHabitacion => {
      // Manejar errores al borrar la habitación
      res.render('error', { error: "Error borrando habitación" });
    });
});


/* Añadir una incidencia a una habitación */
router.post('/:id/incidencias', autenticacion, newUpload.newUpload.single('imagen'), (req, res) => {
  Habitacion.findById(req.params.id).then(habitacion => {
    if (habitacion) {

      const incidencia = ({
        descripcion: req.body.descripcion,
        fechaInicio: Date.now(),
      })

      if (req.file) {
        incidencia.imagen = req.file.filename;
      }

      habitacion.incidencias.push(incidencia);
      habitacion.save().then(resultado => {
        res.redirect(`/habitaciones/${req.params.id}`);
      }).catch(error => {
        res.render('error', { error: "Error añadiendo incidencia" })
      })
    }
  }).catch(error => {
    res.render('error',
      { error: "Error encontrando la habitacion" });
  });

});

/* Actualizar el estado de una incidencia de una habitación */
router.put('/:idH/incidencias/:idI', autenticacion, (req, res) => {
  Habitacion.findById(req.params.idH).then(habitacion => {

    const incidencia = habitacion.incidencias.id(req.params.idI);

    if (!incidencia) {
      return res.render('error', { error: "Error encontrando la incidencia" });
    }

    incidencia.fechaFin = Date.now();
    habitacion.save().then(resultado => {
      res.redirect(`/habitaciones/${req.params.idH}`);
    }).catch(error => {
      res.render('error', { error: "Error añadiendo incidencia" })
    })

  }).catch(error => {
    res.render('error',
      { error: "Error encontrando la habitacion" });
  });

});


module.exports = router;
