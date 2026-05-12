require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';  // bind semua interface

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🌐 Local network: http://192.168.18.21:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
});
