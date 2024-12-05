import axios from 'axios';
import crypto from 'crypto';

var token: string | null = null;
var urlBase: string = "https://ferrocons.procomisp.com.ar/v2"

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
        const respuesta = await axios.get(`${urlBase}/products`,{
            headers: {
                'Authorization': `Bearer ${token}`, // Header de autenticación
                'Accept-Encoding': 'gzip, deflate, br', // Header para codificación
                'Accept': 'application/json', // Header para aceptar JSON
                'Content-Type': 'application/json' // Header para tipo de contenido
            }
        })
        const cantidad = respuesta.data.count;
        return cantidad;
    }
    catch(error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
}

async function obtenerDatos(token: string, cantidad: number): Promise<any> {
    const todosLosDatos: any[] = [];
    const limitePorPagina = 200;
    let offset = 0;
    let offsetMax = cantidad/200;
    let totalElementos = 0;
    try {
        do{
            const respuesta = await axios.get(`${urlBase}/products?limit=200&offset=${offset}&ACTIVO=1`, {
            headers: {
                'Authorization': `Bearer ${token}`, // Header de autenticación
                'Accept-Encoding': 'gzip, deflate, br', // Header para codificación
                'Accept': 'application/json', // Header para aceptar JSON
                'Content-Type': 'application/json' // Header para tipo de contenido
            }

            
        })
        let items = respuesta.data.data;
        todosLosDatos.push(...items);
        totalElementos = respuesta.data.count; // Total de elementos disponibles
        offset += 1;
        console.log(todosLosDatos)
    } while (offset < offsetMax);

    return todosLosDatos;
    } catch (error) {
        console.error('Error al obtener datos:', error);
        throw error;
    }
}

// Uso de la función
(async () => {
    try {
        const token = await obtenerToken();
        console.log(token);
        const cantidad = await obtenerCount(token);
        console.log("Cantidad:", cantidad)
        //const datos = await obtenerDatos(token, cantidad); // Usa el token para obtener datos
        //console.log("Datos obtenidos:", datos);
    } catch (error) {
        console.error("Error al obtener y manejar el token:", error);
    }
})();

// function calcularHash(datos: any): string {
//     return crypto.createHash('sha256').update(JSON.stringify(datos)).digest('hex');
// }

// // URL del endpoint
// const apiUrl = "https://api.ejemplo.com/endpoint";

// // Almacén de hash previo
// let hashAnterior: string;

// // Función para verificar cambios
// async function verificarCambios() {
//     try {
//         const nuevosDatos = await obtenerDatos(apiUrl);
//         const nuevoHash = calcularHash(nuevosDatos);

//         if (!hashAnterior) {
//             // Primera vez
//             hashAnterior = nuevoHash;
//             console.log("Datos iniciales obtenidos.");
//         } else if (nuevoHash !== hashAnterior) {
//             console.log("Los datos han cambiado.");
//             // Procesar cambios aquí
//             hashAnterior = nuevoHash;
//         } else {
//             console.log("No hay cambios en los datos.");
//         }
//     } catch (error) {
//         console.error("Error al verificar cambios:", error);
//     }
// }

// // Configurar la ejecución periódica
// //const intervalo = 60000; // Intervalo en milisegundos (60 segundos)
// //setInterval(verificarCambios, intervalo);

// // Llamar la función una vez al inicio
// //verificarCambios();