import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketServer } from 'socket.io';

dotenv.config();

const port = process.env.PORT || 3001;

const app: Express = express();
const server: http.Server = http.createServer(app);

const socketIO = new SocketServer(server);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

socketIO.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  socket.on('message', (msg) => {
    console.log('message: ' + msg);
  });
});

server.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
