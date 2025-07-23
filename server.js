const http = require("http");
const app = require("./app");

const { initializeSocket } = require("./socket");

const port = 3000 || process.env.PORT;

const server = http.createServer(app);

initializeSocket(server);

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
