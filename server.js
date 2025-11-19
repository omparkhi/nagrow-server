  const http = require("http");
  const app = require("./app");
 

  const { initializeSocket } = require("./socket");
  // const { getIo } = require("./socket");

  const port = process.env.PORT || 3000;
  

  const server = http.createServer(app);

  initializeSocket(server);

  server.listen(port, '0.0.0.0', () => {
    console.log(`server is running on port ${port}`);
  });
