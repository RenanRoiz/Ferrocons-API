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

function sql(){
    try{
        connection.connect();
        // connection.query("SELECT * FROM ferrocons.ps_feature",function (error: any, results: any, fields: any) {
        //     if (error) throw error;
        //     console.log('The solution is: ', results[0].id_feature);
        //   })
        connection.query("CREATE TABLE IF NOT EXISTS `pruebita` (`descripcion` VARCHAR(255), `precio` INT);");
        connection.query("INSERT INTO `pruebita` VALUES ('Lucas',25)");
        connection.query(`CREATE TABLE IF NOT EXISTS 'brain_code_prueba' (id_product INT, id_flexxus INT
            , reference INT, price_per_unit FLOAT, weight INT, price_per_box FLOAT, coefficient FLOAT, stock FLOAT,
            fecha_upd_Flexxus FLOAT)
`)
        connection.end();
    }
    catch (error){
        console.error(error);
    }
}

async function poblarBase(datos: any[]){
    try{
        connection.connect();
        connection.query(`
            CREATE TABLE IF NOT EXISTS ps_braincode_productos (
                ID_FLEXXUS VARCHAR(40),
                REFERENCE VARCHAR(40),
                NOMBRE TEXT,
                ACTIVO BOOL,
                MARCA TEXT,
                RUBRO TEXT,
                CATEGORIA TEXT,
                DESCRIPCION_UNIDADMEDIDA TEXT,
                STOCK TEXT,
                PRECIO_POR_UNIDAD FLOAT,
                COEFICIENTEIVA FLOAT,
                PESO FLOAT,
                FECHAMODIFICACION TEXT,
                COEFICIENTE_CONVERSION FLOAT
            )
        `);

        datos.forEach(item => {
            const query = `
                INSERT INTO ps_braincode_productos (
                    ID_FLEXXUS, REFERENCE, NOMBRE, ACTIVO, MARCA, RUBRO,
                    CATEGORIA, DESCRIPCION_UNIDADMEDIDA, PRECIO_POR_UNIDAD,
                    COEFICIENTEIVA, PESO, FECHAMODIFICACION, COEFICIENTE_CONVERSION
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    REFERENCE = VALUES(REFERENCE)
            `;

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

            connection.query(query, values, (error: any) => {
                if (error) throw error;
            });
        });

        connection.end();
    }
    catch(error){

    }
}

async function obtenerToken(): Promise<string> {
    try {
        const respuesta = await axios.post(`${urlBase}/auth/login`, {
            username: "CANJ",
            password: "CANJ",
            deviceinfo: `{"model":"0","platform":"0","uuid":"4953457348957348975","version":"0","manufacturer":"0"}`
        });
        const token = respuesta.data.token; // Obtenemos el token de la respuesta
        return token; // Devolvemos el token
    } catch (error) {
        console.error("Error al obtener el token:", error);
        throw error; // Relanzamos el error para manejarlo en niveles superiores
    }
}

async function obtenerCount(token:string):Promise<any>{
    try{
        // const respuesta = await axios.get(`${urlBase}/products`,{
        //     headers: {
        //         'Authorization': `Bearer ${token}`, // Header de autenticación
        //         'Accept-Encoding': 'gzip, deflate, br', // Header para codificación
        //         'Accept': 'application/json', // Header para aceptar JSON
        //         'Content-Type': 'application/json' // Header para tipo de contenido
        //     }
        // })
        const respuesta = await axios.get(`${urlBase}/stock?warehouse_list=001`,{
            headers: {
                'Authorization': `Bearer ${token}`, // Header de autenticación
                'Accept-Encoding': 'gzip, deflate, br', // Header para codificación
                'Accept': 'application/json', // Header para aceptar JSON
                'Content-Type': 'application/json' // Header para tipo de contenido
            }
        })
        const respuestaFinal = respuesta.data.data;
        const cantidad = respuestaFinal.length;
        return cantidad;
    }
    catch(error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
}

async function obtenerDatos(token: string): Promise<void> {
    connection.connect();
    await new Promise((resolve, reject) => {
        connection.query(`
            CREATE TABLE IF NOT EXISTS ps_braincode_productos (
                ID_FLEXXUS VARCHAR(40),
                REFERENCE VARCHAR(40),
                NOMBRE TEXT,
                ACTIVO BOOL,
                MARCA TEXT,
                RUBRO TEXT,
                CATEGORIA TEXT,
                DESCRIPCION_UNIDADMEDIDA TEXT,
                STOCK TEXT,
                PRECIO_POR_UNIDAD FLOAT,
                COEFICIENTEIVA FLOAT,
                PESO FLOAT,
                FECHAMODIFICACION TEXT,
                COEFICIENTE_CONVERSION FLOAT
            )
        `, (error: any) => {
            if (error) return reject(error);
            resolve(null);
        });
    });
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
                INSERT INTO ps_braincode_productos (
                    ID_FLEXXUS, REFERENCE, NOMBRE, ACTIVO, MARCA, RUBRO,
                    CATEGORIA, DESCRIPCION_UNIDADMEDIDA, PRECIO_POR_UNIDAD,
                    COEFICIENTEIVA, PESO, FECHAMODIFICACION, COEFICIENTE_CONVERSION
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    REFERENCE = VALUES(REFERENCE)
            `;
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

async function obtenerStockCHAT(token: string): Promise<void> {
    connection.connect(); // Conectar antes de procesar los datos
    try {
            // Llamada a la API para obtener los datos
            const respuesta = await axios.get(`${urlBase}/stock?warehouse_list=001%2C%20002%2C%20004%2C%20006%2C%20011%2C%20013%2C%20009&limit=-1`, {
                headers: {
                    'Authorization': `Bearer ${token}`, // Header de autenticación
                    'Accept-Encoding': 'gzip, deflate, br', // Header para codificación
                    'Accept': 'application/json', // Header para aceptar JSON
                    'Content-Type': 'application/json' // Header para tipo de contenido
                }
            });

            const items = respuesta.data.data;

            // Insertar los datos directamente en la base de datos
            for (const item of items) {
                const query = `
                    UPDATE ps_braincode_productos 
                    SET STOCK = ?
                    WHERE REFERENCE = ?
                `;
                const values = [
                    item.STOCKREMANENTE,
                    item.CODIGO_PRODUCTO
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
    } finally {
        connection.end(); // Cerrar la conexión
    }
}


//sql();
//poblarBase();

//Uso de la función
(async () => {
    try {
        const token = await obtenerToken();
        console.log(token);
        const datos = await obtenerDatos(token); // Usa el token para obtener datos
        // const cantidad = await obtenerCount(token);
        // console.log("Cantidad:", cantidad)
        //const datos2 = await obtenerStockCHAT(token);
        //stockJBO(datos);

        //console.log("Datos obtenidos:", datos);
    } catch (error) {
        console.error("Error al obtener y manejar el token:", error);
    }
})();