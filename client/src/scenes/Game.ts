import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

export default class Demo extends Phaser.Scene {
  socket!: Socket;

  constructor() {
    super("GameScene");
  }

  preload() {
    this.load.image("logo", "assets/player.png");
  }

  create() {
    this.socket = io("http://localhost:3001");

    const logo = this.add.image(400, 70, "logo");

    this.tweens.add({
      targets: logo,
      y: 350,
      duration: 1500,
      ease: "Sine.inOut",
      yoyo: true,
      repeat: -1,
    });
  }
}
