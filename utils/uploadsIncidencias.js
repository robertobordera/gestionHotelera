const multer = require('multer');

// Configuración para el nuevo directorio de almacenamiento
let newStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/incidencias');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

// Nuevo middleware de Multer
let newUpload = multer({ storage: newStorage });

module.exports = {
    newUpload: newUpload
};
