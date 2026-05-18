const { io } = require('../index'); 
const express = require('express'); 
const socketIO = require('socket.io'); 
const app = express(); 

io.on('connection', (socket) => { 
  console.log('Cliente conectado'); 
  
  // El frontend debe enviar el uid al conectarse 
  const uid = socket.handshake.query['uid']; 
  
  if (uid) { 
    // El usuario se une a una sala con su propio ID 
    socket.join(uid); 
    console.log(`Usuario ${uid} unido a su sala privada`); 
  } 
ß
  // 🔥 NUEVO: Escuchar el mensaje enviado por el emisor
  socket.on('mensaje-privado', (payload) => {
    // payload contiene: { de: "ID_EMISOR", para: "ID_RECEPTOR", message: "texto" }
    
    // Validamos que el destinatario exista en el payload
    if (payload.para) {
      // Reenviamos el mensaje EN TIEMPO REAL únicamente a la sala del receptor
      socket.to(payload.para).emit('mensaje-privado', payload);
      console.log(`Mensaje enviado de ${payload.de} para la sala ${payload.para}`);
    }
  });

  socket.on('disconnect', () => { 
    console.log('Cliente desconectado'); 
  }); 
}); 

// Configurar comunicación periódica cada 30 segundos 
setInterval(() => { 
  io.emit('ping', { message: 'Conexión activa', timestamp: new Date() }); 
  console.log('Ping enviado a todos los clientes'); 
}, 30000);
