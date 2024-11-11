const db = require('../db');

const { obtenerUltimaVersion, desactivarNombresAnteriores, registrarNuevoNombre, obtenerNombreVigente, obtenerNombresNoVigentes } = require('../models/empresaNombreModel');

exports.registrarNombre = (req, res) => {
  const { nombre } = req.body;

  if (!nombre || nombre.length > 20) {
    return res.status(400).json({ error: 'El nombre es requerido y debe tener máximo 20 caracteres.' });
  }

  obtenerUltimaVersion((err, ultimaVersion) => {
    if (err) return res.status(500).json({ error: 'Error al obtener la última versión.' });

    const nuevaVersion = ultimaVersion + 1;

    desactivarNombresAnteriores((err) => {
      if (err) return res.status(500).json({ error: 'Error al desactivar nombres anteriores.' });

      registrarNuevoNombre(nombre, nuevaVersion, (err) => {
        if (err) return res.status(500).json({ error: 'Error al registrar el nuevo nombre.' });
        res.json({ message: 'Nuevo nombre registrado como vigente con éxito', nombre });
      });
    });
  });
};

exports.obtenerNombreVigente = (req, res) => {
  obtenerNombreVigente((err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el nombre vigente.' });
    return res.json(result[0] || {});
  });
};

exports.obtenerNombresNoVigentes = (req, res) => {
  obtenerNombresNoVigentes((err, result) => {
    if (err) return res.status(500).json({ error: 'Error al obtener los nombres no vigentes.' });
    return res.json(result);
  });
};

exports.activarNombre = (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Falta el ID del nombre para activar.' });
  }

  desactivarNombresAnteriores((err) => {
    if (err) return res.status(500).json({ error: 'Error al desactivar nombres anteriores.' });

    const query = `UPDATE empresaNombre SET vigente = 1 WHERE id = ?`;
    db.query(query, [id], (err) => {
      if (err) return res.status(500).json({ error: 'Error al activar el nombre.' });
      res.json({ message: 'Nombre activado como vigente con éxito.' });
    });
  });
};
