# backend-laflecha-node-mongo

# Info para el archivo .env (Uso real)
PORT=3000
DB_MONGO=****

JWT_SECRET=****

# Notificaciones Push (VAPID)
VAPID_PUBLIC_KEY=****
VAPID_PRIVATE_KEY=****
VAPID_EMAIL=mailto:tu-correo@ejemplo.com

# Google Auth
GOOGLE_ID=****
GOOGLE_SECRET=****

# Cloudinary (Gestión de imágenes)
CLOUDINARY_CLOUD_NAME=****
CLOUDINARY_API_KEY=****
CLOUDINARY_API_SECRET=****

# Correo (Nodemailer)
USER_GMAIL=****
PASS_GMAIL=****
HOST_GMAIL=****
PORT_GMAIL=****

# LocalTunnel (Paso a paso) para probar paypal
npm install -g localtunnel
lt --port 3000
Copia la URL que te devuelva
IMPORTANTE (El túnel de seguridad):Al abrir esa URL por primera vez en el navegador, verás una pantalla de advertencia de LocalTunnel. Te pedirá una IP pública. Para obtenerla, abre otra terminal y escribe: curl https://loca.lt
Copia esos números, pégalos en la web de LocalTunnel y dale a "Submit". Ahora el túnel está abierto para PayPal.
