const db = require('../db'); // Importación de db
const { obtenerUltimaVersion, desactivarLogosAnteriores, registrarNuevoLogo, obtenerLogoVigente, obtenerLogosNoVigentes } = require('../models/logoNombreModel');

exports.registrarLogo = (req, res) => {
  const logoUrl = req.file ? req.file.path : null;

  if (!logoUrl) {
    return res.status(400).json({ error: 'El logo es requerido.' });
  }

  obtenerUltimaVersion((err, ultimaVersion) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener la última versión.' });
    }

    // Incrementamos la versión en 1.0 para cada nuevo registro
    const nuevaVersion = ultimaVersion + 1.0;

    desactivarLogosAnteriores((err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al desactivar logos anteriores.' });
      }

      registrarNuevoLogo(logoUrl, nuevaVersion, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Error al registrar el nuevo logo.' });
        }
        res.json({ message: 'Nuevo logo registrado como vigente con éxito', logoUrl });
      });
    });
  });
};

exports.obtenerLogoVigente = (req, res) => {
  obtenerLogoVigente((err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener el logo vigente.' });
    }
    return res.json(result[0] || {});
  });
};

exports.obtenerLogosNoVigentes = (req, res) => {
  obtenerLogosNoVigentes((err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los logos no vigentes.' });
    }
    return res.json(result);
  });
};

exports.activarLogo = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Falta el ID del logo para activar.' });
  }

  desactivarLogosAnteriores((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al desactivar logos anteriores.' });
    }

    const query = `UPDATE logoNombre SET vigente = 1 WHERE id = ?`;
    db.query(query, [id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al activar el logo.' });
      }
      res.json({ message: 'Logo activado como vigente con éxito.' });
    });
  });
};
