const esloganModel = require('../models/esloganModel');

// Obtener el eslogan actual
exports.getEslogan = (req, res) => {
  esloganModel.getEslogan((err, result) => {
    if (err) {
      console.error('Error al obtener el eslogan:', err);
      return res.status(500).json({ error: 'Error al obtener el eslogan' });
    }
    res.status(200).json(result[0] || { eslogan: '' });
  });
};

// Actualizar o registrar el eslogan
exports.updateEslogan = (req, res) => {
  const { eslogan } = req.body;

  if (!eslogan) {
    return res.status(400).json({ error: 'El eslogan es requerido.' });
  }

  // Revisar si ya existe un eslogan
  esloganModel.getEslogan((err, result) => {
    if (err) {
      console.error('Error al verificar el eslogan existente:', err);
      return res.status(500).json({ error: 'Error al verificar el eslogan existente' });
    }

    if (result.length > 0) {
      const { id } = result[0]; // Obtener el `id` del eslogan actual
      // Si existe, actualizamos el eslogan
      esloganModel.updateEslogan(id, eslogan, (err) => {
        if (err) {
          console.error('Error al actualizar el eslogan:', err);
          return res.status(500).json({ error: 'Error al actualizar el eslogan' });
        }
        res.status(200).json({ message: 'Eslogan actualizado con éxito.' });
      });
    } else {
      // Si no existe, lo registramos
      esloganModel.createEslogan(eslogan, (err) => {
        if (err) {
          console.error('Error al crear el eslogan:', err);
          return res.status(500).json({ error: 'Error al crear el eslogan' });
        }
        res.status(201).json({ message: 'Eslogan registrado con éxito.' });
      });
    }
  });
};
