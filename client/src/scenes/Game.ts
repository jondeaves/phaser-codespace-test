import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

export default class Demo extends Phaser.Scene {
  socket!: Socket;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("player", "assets/player.png");
  }

  create() {
    this.socket = io("http://localhost:4000");

    const playerImage = this.add.image(400, 70, "player");
  }
}
