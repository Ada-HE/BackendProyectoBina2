const contactoModel = require('../models/contactoModel');

// Registrar o actualizar los datos de contacto
exports.registrarActualizarContacto = (req, res) => {
  const { direccion, correo, telefono } = req.body;

  // Validación de los campos
  if (!direccion || !correo || !telefono) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ error: 'El formato del correo es inválido.' });
  }

  const phoneRegex = /^[0-9]{10}$/; // Asumiendo que el teléfono debe ser de 10 dígitos
  if (!phoneRegex.test(telefono)) {
    return res.status(400).json({ error: 'El formato del teléfono es inválido. Debe contener 10 dígitos.' });
  }

  // Verificar si ya existe un registro
  contactoModel.obtenerContacto((err, resultado) => {
    if (err) {
      console.error('Error al obtener el registro de contacto:', err);
      return res.status(500).json({ error: 'Error al verificar los datos de contacto.' });
    }

    if (resultado.length > 0) {
      // Si ya existe un registro, se actualiza
      const id = resultado[0].id;
      contactoModel.actualizarContacto(id, direccion, correo, telefono, (err) => {
        if (err) {
          console.error('Error al actualizar los datos de contacto:', err);
          return res.status(500).json({ error: 'Error al actualizar los datos de contacto.' });
        }
        return res.status(200).json({ message: 'Datos de contacto actualizados con éxito.' });
      });
    } else {
      // Si no existe un registro, se crea uno nuevo
      contactoModel.registrarContacto(direccion, correo, telefono, (err) => {
        if (err) {
          console.error('Error al registrar los datos de contacto:', err);
          return res.status(500).json({ error: 'Error al registrar los datos de contacto.' });
        }
        return res.status(201).json({ message: 'Datos de contacto registrados con éxito.' });
      });
    }
  });
};

// Obtener los datos de contacto
exports.obtenerContacto = (req, res) => {
  contactoModel.obtenerContacto((err, resultados) => {
    if (err) {
      console.error('Error al obtener los datos de contacto:', err);
      return res.status(500).json({ error: 'Error al obtener los datos de contacto.' });
    }
    res.status(200).json(resultados);
  });
};
