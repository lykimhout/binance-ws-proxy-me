const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(clientSocket) {
  let binanceSocket;

  clientSocket.on('message', function incoming(message) {
    const symbol = message.toString().toLowerCase();
    const binanceUrl = `wss://stream.binance.com:9443/ws/${symbol}@trade`;

    binanceSocket = new WebSocket(binanceUrl);

    binanceSocket.on('message', function incoming(data) {
      clientSocket.send(data);
    });

    binanceSocket.on('close', () => {
      console.log(`Binance socket closed for ${symbol}`);
    });
  });

  clientSocket.on('close', () => {
    if (binanceSocket) binanceSocket.close();
  });
});

app.get('/', (req, res) => {
  res.send('Binance WebSocket Proxy is running!');
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
