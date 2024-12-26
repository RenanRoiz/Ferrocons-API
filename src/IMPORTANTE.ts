import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
var mysql = require('mysql');
const contraseña = process.env.password;
var connection = mysql.createConnection({
    host     : 'prestashop.ckov6z6xsxg1.us-east-1.rds.amazonaws.com',
    user     : 'root',
    password : contraseña,
    database : 'ferrocons',
    port: '3306'
  });
var token: string | null = null;
var urlBase: string = "https://ferrocons.procomisp.com.ar/v2"

async function actualizar(token: string): Promise<void> {
    connection.connect();
    try {
            const respuesta = await axios.get(`${urlBase}//products?valid_stock=1&limit=-1`, {
            headers: {
                'Authorization': `Bearer ${token}`, // Header de autenticación
                'Accept-Encoding': 'gzip, deflate, br', // Header para codificación
                'Accept': 'application/json', // Header para aceptar JSON
                'Content-Type': 'application/json' // Header para tipo de contenido
            }
        })
        let items = respuesta.data.data;
        console.log(items)
        for (const item of items) {
            const query = `
                UPDATE ps_braincode_productos
                SET ID_FLEXXUS = ?, REFERENCE = ?, NOMBRE= ?, ACTIVO = ?, MARCA = ?, RUBRO = ?,
                CATEGORIA = ?, DESCRIPCION_UNIDADMEDIDA = ?, PRECIO_POR_UNIDAD = ?,
                COEFICIENTEIVA = ?, PESO = ?, FECHAMODIFICACION = ?, COEFICIENTE_CONVERSION = ?`;
            const values = [
                item.ID_ARTICULO,
                item.CODIGO_PRODUCTO,
                item.NOMBRE,
                item.ACTIVO,
                item.DESCRIPCION_MARCA,
                item.DESCRIPCION_RUBRO,
                item.DESCRIPCION_SUPERRUBRO,
                item.DESCRIPCION_UNIDADMEDIDA,
                item.PRECIOVENTA,
                item.COEFICIENTEIVA,
                item.PESO,
                item.FECHAMODIFICACION,
                item.COEFICIENTECONVERSION
            ];
            // Ejecutar la inserción
            await new Promise((resolve, reject) => {
                connection.query(query, values, (error: any) => {
                    if (error) return reject(error);
                    resolve(null);
                });
            });
        }
    } catch (error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
    finally {
        connection.end(); // Cerrar la conexión
    }
}