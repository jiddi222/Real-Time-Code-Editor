// console.log("🚀 Starting server...");

// import express from "express";
// import http from "http";
// import { Server } from "socket.io";
// import { ACTIONS } from "./Actions.js";
// import path from "path";

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);
// const __dirname = path.resolve();

// const userSocketMap = {};

// const getALlConnectedClients = (roomId) => {
//   return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
//     (socketId) => {
//       return {
//         socketId,
//         username: userSocketMap[socketId],
//       };
//     }
//   );
// };

// // ===================== ⚠️ Serve dist folder ===================== //
// app.use(express.static(path.join(__dirname, "dist")));

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist", "index.html"));
// });
// // ================================================================ //

// // ================== Socket.IO Logic ==================== //
// io.on("connection", (socket) => {
//   console.log("socket connected: " + socket.id);

//   socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
//     userSocketMap[socket.id] = username;
//     socket.join(roomId);
//     const clients = getALlConnectedClients(roomId);
//     clients.forEach(({ socketId }) => {
//       io.to(socketId).emit(ACTIONS.JOINED, {
//         clients,
//         username,
//         socketId: socket.id,
//       });
//     });
//   });

//   socket.on("disconnecting", () => {
//     const rooms = [...socket.rooms];
//     rooms.forEach((roomId) => {
//       socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
//         socketId: socket.id,
//         username: userSocketMap[socket.id],
//       });
//     });

//     delete userSocketMap[socket.id];
//     socket.leave();
//   });

//   socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
//     socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
//   });

//   socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
//     io.to(socketId).emit(ACTIONS.SYNC_CODE, { code });
//   });

//   socket.on(ACTIONS.NEW_CHAT_MESSAGE, ({ roomId, messageObj }) => {
//     io.to(roomId).emit(ACTIONS.NEW_CHAT_MESSAGE, { messageObj });
//   });
// });

// // ================== Start Server ==================== //
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ACTIONS } from "./Actions.js";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Required to emulate __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Starting server...");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const userSocketMap = {};

const getALlConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => ({
      socketId,
      username: userSocketMap[socketId],
    })
  );
};

// ✅ Serve dist folder
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ✅ WebSocket logic
io.on("connection", (socket) => {
  console.log("socket connected: " + socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);
    const clients = getALlConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });

    delete userSocketMap[socket.id];
    socket.leave();
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.SYNC_CODE, { code });
  });

  socket.on(ACTIONS.NEW_CHAT_MESSAGE, ({ roomId, messageObj }) => {
    io.to(roomId).emit(ACTIONS.NEW_CHAT_MESSAGE, { messageObj });
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
