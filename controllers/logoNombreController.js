const logoNombreModel = require('../models/logoNombreModel');
const path = require('path');
const fs = require('fs');

// Registrar nombre y logo
exports.registrarLogoNombre = (req, res) => {
  const { nombre } = req.body;
  const logo = req.file;

  if (!logo) {
    return res.status(400).json({ error: 'El logo es obligatorio.' });
  }

  const extensionValida = ['image/jpeg', 'image/png'].includes(logo.mimetype);
  if (!extensionValida) {
    return res.status(400).json({ error: 'El logo debe ser en formato JPEG o PNG.' });
  }

  const nombreOriginal = logo.originalname.replace(/\s+/g, '-'); // Reemplazar espacios con guiones
  const rutaDestino = path.join(__dirname, '../../frontend/public', nombreOriginal);

  // Verificar si ya existe un archivo con el mismo nombre
  if (fs.existsSync(rutaDestino)) {
    return res.status(400).json({ error: 'Ya existe un archivo con el mismo nombre. Elige otro logo o cambia el nombre del archivo.' });
  }

  // Mover el archivo a la carpeta 'public'
  fs.rename(logo.path, rutaDestino, (err) => {
    if (err) {
      console.error('Error al mover el archivo:', err);
      return res.status(500).json({ error: 'Error al guardar el logo.' });
    }

    // Guardar el nombre de la empresa y el logo en la base de datos
    logoNombreModel.registrarLogoNombre(nombre, nombreOriginal, (err) => {
      if (err) {
        console.error('Error al registrar nombre y logo:', err);
        return res.status(500).json({ error: 'Error al registrar nombre y logo en la base de datos.' });
      }
      // Devolver el nombre del logo para que se pueda usar en el frontend
      res.status(201).json({ message: 'Nombre y logo registrados con éxito.', logoName: nombreOriginal });
    });
  });
};
// Controlador para obtener todos los registros de la tabla
exports.obtenerLogoNombre = (req, res) => {
  logoNombreModel.obtenerLogoNombre((err, resultados) => {
    if (err) {
      console.error('Error al obtener los registros:', err);
      return res.status(500).json({ error: 'Error al obtener los registros de la base de datos.' });
    }
    res.status(200).json(resultados);
  });
};

exports.actualizarLogoNombre = (req, res) => {
  const { nombre } = req.body;
  const logoUrl = req.file ? req.file.path : null; // Solo cambia si hay un archivo nuevo
  const { id } = req.params;

  if (logo) {
    const extensionValida = ['image/jpeg', 'image/png'].includes(logo.mimetype);
    if (!extensionValida) {
      return res.status(400).json({ error: 'El logo debe ser en formato JPEG o PNG.' });
    }

    const nombreOriginal = logo.originalname.replace(/\s+/g, '-'); // Reemplazar espacios con guiones
    const rutaDestino = path.join(__dirname, '../../frontend/public', nombreOriginal);

    // Si el archivo ya existe, lo reemplaza
    fs.rename(logo.path, rutaDestino, (err) => {
      if (err) {
        console.error('Error al mover el archivo:', err);
        return res.status(500).json({ error: 'Error al guardar el logo.' });
      }

      // Actualizar el nombre y el logo en la base de datos
      logoNombreModel.actualizarLogoNombre(id, nombre, nombreOriginal, (err) => {
        if (err) {
          console.error('Error al actualizar nombre y logo:', err);
          return res.status(500).json({ error: 'Error al actualizar nombre y logo en la base de datos.' });
        }
        res.status(200).json({ message: 'Nombre y logo actualizados con éxito.' });
      });
    });
  } else {
    // Si no hay logo, solo actualizar el nombre
    logoNombreModel.actualizarLogoNombre(id, nombre, null, (err) => {
      if (err) {
        console.error('Error al actualizar nombre:', err);
        return res.status(500).json({ error: 'Error al actualizar el nombre en la base de datos.' });
      }
      res.status(200).json({ message: 'Nombre actualizado con éxito.' });
    });
  }
};

