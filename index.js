const express = require('express');
const QRCode = require('qrcode');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const app = express();

// Configuración básica
app.use(express.static('public'));
app.use(express.json());

// Ruta del archivo Excel
const filePath = path.join(__dirname, 'fichajes.xlsx');

// Generar QR con la URL de fichaje
app.get('/generar-qr', (req, res) => {
  const urlFichaje = 'https://tudominio.netlify.app'; // Cambia esto por tu URL de Netlify
  QRCode.toDataURL(urlFichaje, (err, qrCodeDataURL) => {
    if (err) {
      console.error('Error al generar el QR:', err);
      res.status(500).send('Error al generar el QR');
    } else {
      res.send(`<img src="${qrCodeDataURL}" alt="QR Code">`);
    }
  });
});

// Registrar fichaje y guardar en Excel
app.post('/registrar-fichaje', (req, res) => {
  const fichajeData = req.body;

  // Validar que los datos estén completos
  if (!fichajeData.nombre || !fichajeData.fecha || !fichajeData.hora || !fichajeData.ubicacion || !fichajeData.latitud || !fichajeData.longitud) {
    return res.status(400).json({ message: 'Datos incompletos' });
  }

  try {
    let workbook;
    if (fs.existsSync(filePath)) {
      workbook = XLSX.readFile(filePath);
    } else {
      workbook = XLSX.utils.book_new();
    }

    let sheet = workbook.Sheets['Fichajes'];
    if (!sheet) {
      sheet = XLSX.utils.aoa_to_sheet([['Nombre', 'Fecha', 'Hora', 'Ubicación', 'Latitud', 'Longitud', 'Link del Mapa']]);
      XLSX.utils.book_append_sheet(workbook, sheet, 'Fichajes');
    }

    const newRow = [
      fichajeData.nombre,
      fichajeData.fecha,
      fichajeData.hora,
      fichajeData.ubicacion,
      fichajeData.latitud,
      fichajeData.longitud,
      `https://www.google.com/maps?q=${fichajeData.latitud},${fichajeData.longitud}`
    ];

    XLSX.utils.sheet_add_aoa(sheet, [newRow], { origin: -1 });
    XLSX.writeFile(workbook, filePath);

    res.json({ message: 'Fichaje registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar el fichaje:', error);
    res.status(500).json({ message: 'Hubo un error al procesar el fichaje' });
  }
});

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
});