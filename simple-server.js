const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<html><body><h1>Simple Server Works!</h1><p>If you can see this, localhost HTTP is working.</p></body></html>');
});

server.listen(4000, '127.0.0.1', () => {
  console.log('Simple server running at http://127.0.0.1:4000/');
});