const socialMediaModel = require('../models/socialMediaModel');

// Crear una nueva red social
exports.createSocialMedia = (req, res) => {
  const { nombre, url } = req.body;

  socialMediaModel.createSocialMedia(nombre, url, (err) => {
    if (err) {
      console.error('Error al crear la red social:', err);
      return res.status(500).json({ error: 'Error al crear la red social' });
    }
    res.status(201).json({ message: 'Red social creada con éxito' });
  });
};

// Obtener todas las redes sociales
exports.getAllSocialMedia = (req, res) => {
  socialMediaModel.getAllSocialMedia((err, results) => {
    if (err) {
      console.error('Error al obtener las redes sociales:', err);
      return res.status(500).json({ error: 'Error al obtener las redes sociales' });
    }
    res.status(200).json(results);
  });
};

// Actualizar una red social
exports.updateSocialMedia = (req, res) => {
  const { id } = req.params;
  const { nombre, url } = req.body;

  socialMediaModel.updateSocialMedia(id, nombre, url, (err) => {
    if (err) {
      console.error('Error al actualizar la red social:', err);
      return res.status(500).json({ error: 'Error al actualizar la red social' });
    }
    res.status(200).json({ message: 'Red social actualizada con éxito' });
  });
};

// Eliminar lógicamente una red social
exports.deleteSocialMedia = (req, res) => {
  const { id } = req.params;

  socialMediaModel.deleteSocialMedia(id, (err) => {
    if (err) {
      console.error('Error al eliminar la red social:', err);
      return res.status(500).json({ error: 'Error al eliminar la red social' });
    }
    res.status(200).json({ message: 'Red social eliminada lógicamente' });
  });
};
