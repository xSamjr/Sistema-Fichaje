const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

exports.handler = async (event, context) => {
  // Verificar que el método de la solicitud sea POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Método no permitido' }),
    };
  }

  try {
    // Obtener los datos del cuerpo de la solicitud
    const datosFichaje = JSON.parse(event.body);

    // Validar que los datos estén completos
    if (
      !datosFichaje.nombre ||
      !datosFichaje.fecha ||
      !datosFichaje.hora ||
      !datosFichaje.ubicacion ||
      !datosFichaje.latitud ||
      !datosFichaje.longitud
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Datos incompletos' }),
      };
    }

    // Ruta del archivo Excel
    const filePath = path.join(__dirname, '../../fichajes.xlsx');

    // Cargar el archivo Excel existente o crear uno nuevo si no existe
    let workbook;
    if (fs.existsSync(filePath)) {
      workbook = xlsx.readFile(filePath);
    } else {
      workbook = xlsx.utils.book_new();
      const ws = xlsx.utils.aoa_to_sheet([
        ['Nombre', 'Fecha', 'Hora', 'Ubicación', 'Latitud', 'Longitud', 'Link del Mapa'],
      ]);
      xlsx.utils.book_append_sheet(workbook, ws, 'Fichajes');
    }

    // Agregar los datos de fichaje a la hoja de Excel
    const ws = workbook.Sheets['Fichajes'];
    const newRow = [
      datosFichaje.nombre,
      datosFichaje.fecha,
      datosFichaje.hora,
      datosFichaje.ubicacion,
      datosFichaje.latitud,
      datosFichaje.longitud,
      `https://www.google.com/maps?q=${datosFichaje.latitud},${datosFichaje.longitud}`,
    ];

    // Encontrar la siguiente fila vacía y agregar los datos
    xlsx.utils.sheet_add_aoa(ws, [newRow], { origin: -1 });

    // Guardar el archivo Excel actualizado
    xlsx.writeFile(workbook, filePath);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Fichaje registrado correctamente' }),
    };
  } catch (error) {
    console.error('Error al registrar el fichaje:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Hubo un error al procesar el fichaje' }),
    };
  }
};