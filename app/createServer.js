const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('εεΎη΅ζ' + result);
});
server.listen(8080);