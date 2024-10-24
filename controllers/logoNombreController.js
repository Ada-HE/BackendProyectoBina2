const { registrarLogoNombre, actualizarLogoNombre, obtenerLogoNombre } = require('../models/logoNombreModel');

exports.registrarLogoNombre = (req, res) => {
  const { nombre } = req.body;
  const logoUrl = req.file ? req.file.path : null;



  if (!nombre || !logoUrl) {
    return res.status(400).json({ error: 'El nombre y el logo son requeridos.' });
  }

  registrarLogoNombre(nombre, logoUrl, (err, result) => {
    if (err) {
      console.error('Error al registrar en la base de datos:', err);
      return res.status(500).json({ error: 'Error al registrar o actualizar el nombre y logo.' });
    }
    res.json({ message: 'Registro o actualización realizada con éxito', logoUrl });
  });
};


// Controlador para obtener el nombre y logo actuales
exports.obtenerLogoNombre = (req, res) => {
  obtenerLogoNombre((err, result) => {
    if (err) {
      console.error('Error al obtener los datos del logo y nombre:', err);
      return res.status(500).json({ error: 'Error al obtener los datos del logo y nombre.' });
    }
    return res.json(result);
  });
};

exports.actualizarLogoNombre = (req, res) => {
  const { nombre } = req.body;
  const logoUrl = req.file ? req.file.path : null; // Solo cambia si hay un archivo nuevo
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Falta el ID del registro para actualizar.' });
  }

  // Obtener los valores actuales para no sobreescribirlos si no se envían nuevos
  obtenerLogoNombre((err, resultado) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los datos actuales.' });
    }

    const registroActual = resultado[0];

    // Si no se envía un nuevo nombre, usar el nombre actual
    const nombreActualizado = nombre || registroActual.nombre;

    // Si no se envía un nuevo logo, usar el logo actual
    const logoActualizado = logoUrl || registroActual.logo;

    // Actualizar el registro con los valores proporcionados
    actualizarLogoNombre(id, nombreActualizado, logoActualizado, (err, result) => {
      if (err) {
        console.error('Error al actualizar en la base de datos:', err);
        return res.status(500).json({ error: 'Error al actualizar el nombre y logo.' });
      }
      res.json({ message: 'Actualización realizada con éxito', logoUrl: logoActualizado });
    });
  });
};

