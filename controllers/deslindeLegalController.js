const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const deslindeLegalModel = require('../models/deslindeLegalModel');

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

exports.createDeslinde = async (req, res) => {
  console.log("Solicitud recibida para subir deslinde legal");

  if (!req.file) {
    console.log("No se subió ningún archivo");
    return res.status(400).json({ error: 'No se ha subido ningún archivo PDF' });
  }

  console.log("Archivo subido:", req.file);

  const filePath = path.join(__dirname, '../uploads', req.file.filename);

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const contenido = pdfData.text;
    console.log("Contenido extraído del PDF:", contenido);

    const titulo = 'Deslinde Legal';

    // Obtener la versión más alta actual
    deslindeLegalModel.getHighestVersion((err, result) => {
      if (err) {
        console.error("Error al obtener la versión actual:", err);
        return res.status(500).json({ error: 'Error al obtener la versión actual' });
      }

      // Si no hay versiones anteriores, establece la primera versión como 1.0
      const highestVersion = result[0] && result[0].version ? parseFloat(result[0].version) : 0;
      const newVersion = (highestVersion + 1).toFixed(1); // Incrementar la versión en 1.0
      console.log("Nueva versión calculada:", newVersion);

      // Desactivar el deslinde vigente actual
      deslindeLegalModel.deactivateCurrentDeslinde((err) => {
        if (err) {
          console.error("Error al desactivar el deslinde vigente:", err);
          return res.status(500).json({ error: 'Error al desactivar el deslinde vigente' });
        }

        // Crear un nuevo deslinde legal con la nueva versión
        deslindeLegalModel.createDeslindeLegal(titulo, contenido, newVersion, (err) => {
          if (err) {
            console.error("Error al crear el deslinde legal:", err);
            return res.status(500).json({ error: 'Error al crear el deslinde legal' });
          }
          res.status(201).json({ message: 'Deslinde legal creado y marcado como vigente', contenido });
        });
      });
    });
  } catch (error) {
    console.error('Error al procesar el archivo PDF:', error);
    res.status(500).json({ error: 'Error al procesar el archivo PDF' });
  }
};

// Obtener todos los deslindes legales
exports.getAllDeslindes = (req, res) => {
  deslindeLegalModel.getAllDeslindes((err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los deslindes legales' });
    res.status(200).json(results);
  });
};

// Obtener el deslinde legal vigente
exports.getActiveDeslinde = (req, res) => {
  deslindeLegalModel.getActiveDeslinde((err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el deslinde vigente' });
    res.status(200).json(result[0]);
  });
};

// Actualizar un deslinde existente
exports.updateDeslinde = (req, res) => {
  const { id, titulo, contenido, version } = req.body;

  deslindeLegalModel.updateDeslinde(id, titulo, contenido, version, (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar el deslinde legal' });
    res.status(200).json({ message: 'Deslinde legal actualizado con éxito' });
  });
};

// Marcar un deslinde como vigente
exports.setDeslindeAsActive = (req, res) => {
  const { id } = req.body;

  deslindeLegalModel.setDeslindeAsActive(id, (err) => {
    if (err) return res.status(500).json({ error: 'Error al activar el deslinde legal' });
    res.status(200).json({ message: 'Deslinde legal activado' });
  });
};

// Eliminar lógicamente un deslinde legal
exports.deleteDeslinde = (req, res) => {
  const { id } = req.body;

  deslindeLegalModel.deleteDeslinde(id, (err) => {
    if (err) return res.status(500).json({ error: 'Error al eliminar el deslinde legal' });
    res.status(200).json({ message: 'Deslinde legal eliminado lógicamente' });
  });
};
exports.editDeslinde = async (req, res) => {
  const { id, titulo, contenido } = req.body;

  try {
    // Obtener la versión más alta actual
    deslindeLegalModel.getHighestVersion((err, result) => {
      if (err) {
        console.error("Error al obtener la versión actual:", err);
        return res.status(500).json({ error: 'Error al obtener la versión actual' });
      }

      const highestVersion = result[0] && result[0].version ? parseFloat(result[0].version) : 0;
      const newVersion = (highestVersion + 1).toFixed(1); // Incrementar la versión en 1.0
      console.log("Nueva versión calculada:", newVersion);

      // Desactivar el deslinde vigente actual
      deslindeLegalModel.deactivateCurrentDeslinde((err) => {
        if (err) {
          console.error("Error al desactivar el deslinde vigente:", err);
          return res.status(500).json({ error: 'Error al desactivar el deslinde vigente' });
        }

        // Crear un nuevo deslinde legal con la nueva versión
        deslindeLegalModel.createDeslindeLegal(titulo, contenido, newVersion, (err) => {
          if (err) {
            console.error("Error al crear el deslinde legal editado:", err);
            return res.status(500).json({ error: 'Error al crear la nueva versión del deslinde legal' });
          }
          res.status(201).json({ message: 'Deslinde legal editado y nueva versión creada', contenido });
        });
      });
    });
  } catch (error) {
    console.error('Error al procesar la edición:', error);
    res.status(500).json({ error: 'Error al procesar la edición del deslinde legal' });
  }
};

