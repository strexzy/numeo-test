import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import path from "path";
import { handleAudioTranslation } from "./utils/handle-audio-translation";

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket: Socket) => {
  console.log("Client connected: ", socket.id);

  socket.on("audio-cunk", async (audioBuffer: Buffer) => {
    try {
      const translation = await handleAudioTranslation(audioBuffer);
      socket.emit("translation-result", translation);
    } catch (error) {
      console.log("Error processing audio: ", error);
      socket.emit("error", (error as Error).message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
