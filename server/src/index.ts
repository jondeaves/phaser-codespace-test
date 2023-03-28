import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Server as SocketServer } from 'socket.io';

import { PlayerInfo, PositionData } from '../../shared/types';

dotenv.config();

const port = process.env.PORT || 3001;
const app: Express = express();
const players = new Map<string, PlayerInfo>();

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

const expressServer = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

const socketIO = new SocketServer(expressServer, {
  cors: {
    origin: '*',
  },
});

socketIO.on('connection', (socket) => {
  console.log(
    `Player connected: ${socket.id}:${socket.handshake.auth.username}`,
  );

  if (socket.handshake.auth.username.length === 0) {
    console.log('Rejected connection due to username');
    socket.disconnect();

    return;
  }

  // create a new player and add it to our players object
  players[socket.id] = {
    username: socket.handshake.auth.username,
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    playerId: socket.id,
    color: Math.floor(Math.random() * 16777215).toString(16),
  };

  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    // remove this player from our players object
    delete players[socket.id];

    // emit a message to all players to remove this player
    socketIO.emit('playerDisconnected', socket.id);
  });

  socket.on('message', (msg) => {
    console.log('message: ' + msg);
  });

  socket.on('playerMovement', (positionData: PositionData) => {
    console.log(
      `${socket.id} moved to {x: ${positionData.x}, y: ${positionData.y}, r: ${positionData.r}}`,
    );

    // TODO: This could be exploited by client if they were to change the value before sending
    // So we should receive a move direction and then update it according to known speed values
    players[socket.id].x = positionData.x;
    players[socket.id].y = positionData.y;
    players[socket.id].r = positionData.r;

    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
});
