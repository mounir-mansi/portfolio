require("dotenv").config();
const http = require("http");
const app = require("./src/app");

const PORT = process.env.PORT || 3002;
const HOST = process.env.NODE_ENV === "production" ? "127.0.0.1" : "0.0.0.0";

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`Serveur démarré sur http://${HOST}:${PORT} [${process.env.NODE_ENV}]`);
});
