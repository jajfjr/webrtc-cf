export default {
  fetch(request, env) {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("WebSocket only", { status: 400 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    server.accept();

    server.addEventListener("message", (event) => {
      // broadcast ke semua client di room sederhana
      for (const ws of connections) {
        if (ws !== server) {
          ws.send(event.data);
        }
      }
    });

    server.addEventListener("close", () => {
      connections.delete(server);
    });

    connections.add(server);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
};

const connections = new Set();
