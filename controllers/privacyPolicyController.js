const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const privacyPolicyModel = require('../models/privacyPolicyModel');

// Configuración de Multer para subir archivos
const upload = multer({ dest: 'uploads/' });

exports.createPolicy = async (req, res) => {
  console.log("Solicitud recibida para subir política de privacidad"); // Log para saber si la solicitud llega

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

    const titulo = 'Políticas de Privacidad';

    // Obtener la versión más alta actual
    privacyPolicyModel.getHighestVersion((err, result) => {
      if (err) {
        console.error("Error al obtener la versión actual:", err);
        return res.status(500).json({ error: 'Error al obtener la versión actual' });
      }

      const highestVersion = result[0] ? result[0].version : 0;
      const newVersion = (parseFloat(highestVersion) + 1).toFixed(1); // Incrementa la versión en 1.0
      console.log("Nueva versión calculada:", newVersion); // Log para la nueva versión

      privacyPolicyModel.deactivateCurrentPolicy((err) => {
        if (err) {
          console.error("Error al desactivar la política vigente:", err);
          return res.status(500).json({ error: 'Error al desactivar la política vigente' });
        }

        privacyPolicyModel.createPrivacyPolicy(titulo, contenido, newVersion, (err) => {
          if (err) {
            console.error("Error al crear la política de privacidad:", err);
            return res.status(500).json({ error: 'Error al crear la política de privacidad' });
          }
          res.status(201).json({ message: 'Política de privacidad creada y marcada como vigente', contenido });
        });
      });
    });
  } catch (error) {
    console.error('Error al procesar el archivo PDF:', error);
    res.status(500).json({ error: 'Error al procesar el archivo PDF' });
  }
};


// Obtener todas las políticas de privacidad
exports.getAllPolicies = (req, res) => {
  privacyPolicyModel.getAllPolicies((err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener las políticas de privacidad' });
    res.status(200).json(results);
  });
};

// Obtener la política vigente
exports.getActivePolicy = (req, res) => {
  privacyPolicyModel.getActivePolicy((err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la política vigente' });
    res.status(200).json(result[0]);
  });
};

// Actualizar una política existente
exports.updatePolicy = (req, res) => {
  const { id, titulo, contenido, version } = req.body;
  
  privacyPolicyModel.updatePolicy(id, titulo, contenido, version, (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar la política de privacidad' });
    res.status(200).json({ message: 'Política de privacidad actualizada con éxito' });
  });
};

// Marcar una política como vigente
exports.setPolicyAsActive = (req, res) => {
  const { id } = req.body;
  
  privacyPolicyModel.setPolicyAsActive(id, (err) => {
    if (err) return res.status(500).json({ error: 'Error al activar la política de privacidad' });
    res.status(200).json({ message: 'Política de privacidad activada' });
  });
};
exports.editPolicy = async (req, res) => {
  const { id, titulo, contenido } = req.body;

  try {
    // Obtener la versión más alta actual
    privacyPolicyModel.getHighestVersion((err, result) => {
      if (err) {
        console.error("Error al obtener la versión actual:", err);
        return res.status(500).json({ error: 'Error al obtener la versión actual' });
      }

      const highestVersion = result[0] ? result[0].version : 0;
      const newVersion = (parseFloat(highestVersion) + 1).toFixed(1); // Incrementa la versión en 1.0

      privacyPolicyModel.deactivateCurrentPolicy((err) => {
        if (err) {
          console.error("Error al desactivar la política vigente:", err);
          return res.status(500).json({ error: 'Error al desactivar la política vigente' });
        }

        privacyPolicyModel.createPrivacyPolicy(titulo, contenido, newVersion, (err) => {
          if (err) {
            console.error("Error al crear la nueva versión de la política de privacidad:", err);
            return res.status(500).json({ error: 'Error al crear la nueva versión de la política de privacidad' });
          }
          res.status(201).json({ message: 'Política de privacidad editada y nueva versión creada', contenido });
        });
      });
    });
  } catch (error) {
    console.error('Error al procesar la edición:', error);
    res.status(500).json({ error: 'Error al procesar la edición de la política de privacidad' });
  }
};
exports.deletePolicy = (req, res) => {
  const { id } = req.body; // Obtener el ID de la política a eliminar

  privacyPolicyModel.deletePolicy(id, (err) => {
    if (err) {
      console.error("Error al eliminar la política de privacidad:", err);
      return res.status(500).json({ error: 'Error al eliminar la política de privacidad' });
    }
    res.status(200).json({ message: 'Política de privacidad eliminada lógicamente' });
  });
};


