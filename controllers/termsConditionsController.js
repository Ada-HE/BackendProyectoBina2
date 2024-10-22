const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const termsConditionsModel = require('../models/termsConditionsModel');

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

exports.createTermsConditions = async (req, res) => {
  console.log("Solicitud recibida para subir Término y Condicion"); // Log para saber si la solicitud llega

  if (!req.file) {
    console.log("No se subió ningún archivo");
    return res.status(400).json({ error: 'No se ha subido ningún archivo PDF' });
  }

  console.log("Archivo subido:", req.file); // Log para verificar el archivo subido

  const filePath = path.join(__dirname, '../uploads', req.file.filename);

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const contenido = pdfData.text;  // Contenido extraído del PDF
    console.log("Contenido extraído del PDF:", contenido); // Log para el contenido extraído

    const titulo = 'Términos y Codiciones ';

    // Obtener la versión más alta actual
    termsConditionsModel.getHighestVersion((err, result) => {
      if (err) {
        console.error("Error al obtener la versión actual:", err);
        return res.status(500).json({ error: 'Error al obtener la versión actual' });
      }

      const highestVersion = result[0] ? result[0].version : 0;
      const newVersion = (parseFloat(highestVersion) + 1).toFixed(1); // Incrementa la versión en 1.0
      console.log("Nueva versión calculada:", newVersion); // Log para la nueva versión

      termsConditionsModel.deactivateCurrentTermsConditions((err) => {
        if (err) {
          console.error("Error al desactivar el Término y condicion vigente:", err);
          return res.status(500).json({ error: 'Error al desactivar el Término y condicion vigente' });
        }

        termsConditionsModel.createTermsConditions(titulo, contenido, newVersion, (err) => {
          if (err) {
            console.error("Error al crear el Término y condicion:", err);
            return res.status(500).json({ error: 'Error al crear el Término y condicion' });
          }
          res.status(201).json({ message: 'Término y condicion creada y marcada como vigente', contenido });
        });
      });
    });
  } catch (error) {
    console.error('Error al procesar el archivo PDF:', error);
    res.status(500).json({ error: 'Error al procesar el archivo PDF' });
  }
};


// Obtener todas los Términos y Condiciones de privacidad
exports.getTermsConditions = (req, res) => {
  termsConditionsModel.getTermsConditions((err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los Términos y condiciones' });
    res.status(200).json(results);
  });
};

// Obtener la Términos y Condiciones vigente
exports.getActiveTermsConditions = (req, res) => {
  termsConditionsModel.getActiveTermsConditions((err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la Términos y Condiciones' });
    res.status(200).json(result[0]);
  });
};

// Actualizar una Términos y Condiciones existente
exports.updateTermsConditions = (req, res) => {
  const { id, titulo, contenido, version } = req.body;
  
  termsConditionsModel.updateTermsConditions(id, titulo, contenido, version, (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar los Términos y Condiciones' });
    res.status(200).json({ message: 'Términos y Condiciones actualizados con éxito' });
  });
};

// Marcar una Términos y Condiciones como vigente
exports.setTermsConditionsAsActive = (req, res) => {
  const { id } = req.body;
  
  termsConditionsModel.setTermsConditionsAsActive(id, (err) => {
    if (err) return res.status(500).json({ error: 'Error al activar los Términos y Condiciones' });
    res.status(200).json({ message: 'Términos y Condiciones activada' });
  });
};
exports.editTermsConditions = async (req, res) => {
  const { id, titulo, contenido } = req.body;

  try {
    // Obtener la versión más alta actual
    termsConditionsModel.getHighestVersion((err, result) => {
      if (err) {
        console.error("Error al obtener la versión actual:", err);
        return res.status(500).json({ error: 'Error al obtener la versión actual' });
      }

      const highestVersion = result[0] ? result[0].version : 0;
      const newVersion = (parseFloat(highestVersion) + 1).toFixed(1); // Incrementa la versión en 1.0

      termsConditionsModel.deactivateCurrentTermsConditions((err) => {
        if (err) {
          console.error("Error al desactivar el Término vigente:", err);
          return res.status(500).json({ error: 'Error al desactivar el Término vigente' });
        }

        termsConditionsModel.createTermsConditions(titulo, contenido, newVersion, (err) => {
          if (err) {
            console.error("Error al crear la nueva versión de los Términos y Condiciones:", err);
            return res.status(500).json({ error: 'Error al crear la nueva versión de los Términos y Condiciones' });
          }
          res.status(201).json({ message: 'Términos y Condiciones editada y nueva versión creada', contenido });
        });
      });
    });
  } catch (error) {
    console.error('Error al procesar la edición:', error);
    res.status(500).json({ error: 'Error al procesar la edición de los Términos y Condiciones' });
  }
};
exports.deleteTermsConditions = (req, res) => {
  const { id } = req.body; // Obtener el ID de la política a eliminar

  termsConditionsModel.deleteTermsConditions(id, (err) => {
    if (err) {
      console.error("Error al eliminar los Términos y Condiciones:", err);
      return res.status(500).json({ error: 'Error al eliminar el Termino y condicion' });
    }
    res.status(200).json({ message: 'Términos y Condiciones eliminada lógicamente' });
  });
};


