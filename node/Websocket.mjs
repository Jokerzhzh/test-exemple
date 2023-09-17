import fs from "fs";
import http from "http";
import path from "path";
import { WebSocketServer } from "ws";

const { baseHost, appProt, wsProt } = process.env;

const apps = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);

  if (req.url === "/") {
    fs.readFile(path.resolve("./html/Webscoket.html"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      }
    });
  } else if (req.url === "/js/Websocket.js") {
    fs.readFile(path.resolve("./js/Websocket.js"), (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(200, { "Content-Type": "text/javascript" });
        res.end(data);
      }
    });
  } else if (req.url === "/env") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(JSON.stringify({ baseHost, appProt, wsProt }));
  } else if (req.url === "/serverStatus") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(JSON.stringify({ serverStatus: verifyRes }));
  } else if (req.url === "/openwss") {
    verifyRes = true;
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("openwss");
  } else if (req.url === "/closewss") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    verifyRes = false;
    wss.clients.values().next().value.close();
    res.end("closewss");
  } else if (req.url === "/websocket-retry") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(JSON.stringify({ serverStatus: verifyRes }));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

apps.listen(appProt, (req, res) => {
  console.log(`Server is listening at port: http://${baseHost}:${appProt}`);
});

let verifyRes = true;

const wss = new WebSocketServer({
  host: baseHost,
  port: wsProt,
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3,
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024,
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024, // Size (in bytes) below which messages
    // should not be compressed if context takeover is disabled.
  },
  verifyClient: (info) => {
    return verifyRes;
  },
});

let i = 0;

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  // console.log("🚀 ~ ip:", ip);

  ws.on("error", console.error);

  ws.on("message", (data) => {
    i++;
    if (i % 3 === 0) ws.send(`Received a total of ${i} messages`);
    console.log("received: %s", data);
  });

  ws.send("connection succeeded !");
});

wss.on("error", console.error);
