import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

import { PlayerInfo, PositionData } from "../../../shared/types";

export default class GameScene extends Phaser.Scene {
  socket!: Socket;
  player!: Phaser.GameObjects.Sprite;
  otherPlayers!: Phaser.GameObjects.Group;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  moveSpeed: number;
  oldPosition!: PositionData;

  constructor() {
    super("GameScene");

    this.moveSpeed = 2;
  }

  preload() {
    this.load.image("player", "assets/player.png");
  }

  create() {
    this.socket = io("http://localhost:4000");
    this.otherPlayers = this.add.group();
    this.cursors = this.input.keyboard.createCursorKeys();

    const self = this;

    // Losing connection to server
    this.socket.on("disconnect", (reason) => {
      self.player.destroy();
      self.otherPlayers.getChildren().forEach((otherPlayer) => {
        otherPlayer.destroy();
      });
    });

    // Custom events
    this.socket.on("currentPlayers", (players) => {
      Object.keys(players).forEach((id) => {
        if (players[id].playerId === self.socket.id) {
          self.addPlayer(players[id]);
        } else {
          self.addOtherPlayer(players[id]);
        }
      });
    });

    this.socket.on("newPlayer", function (playerInfo) {
      self.addOtherPlayer(playerInfo);
    });

    this.socket.on("playerDisconnected", (plaeryId) => {
      self.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (plaeryId === otherPlayer.getData("playerId")) {
          otherPlayer.destroy();
        }
      });
    });

    this.socket.on("playerMoved", (playerInfo: PlayerInfo) => {
      self.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerInfo.playerId === otherPlayer.getData("playerId")) {
          (otherPlayer as Phaser.GameObjects.Sprite)
            .setRotation(playerInfo.rotation)
            .setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });
  }

  update(time: number, delta: number): void {
    if (this.player === undefined) {
      return;
    }

    const newPosition: PositionData = {
      x: this.player.x,
      y: this.player.y,
      r: this.player.rotation,
    };

    if (this.cursors.down.isDown) {
      newPosition.y += 1 * this.moveSpeed;
    } else if (this.cursors.up.isDown) {
      newPosition.y -= 1 * this.moveSpeed;
    }

    if (this.cursors.left.isDown) {
      newPosition.x -= 1 * this.moveSpeed;
    } else if (this.cursors.right.isDown) {
      newPosition.x += 1 * this.moveSpeed;
    }

    this.player.setPosition(newPosition.x, newPosition.y);

    if (
      this.oldPosition &&
      (newPosition.x !== this.oldPosition.x ||
        newPosition.y !== this.oldPosition.y ||
        newPosition.r !== this.oldPosition.r)
    ) {
      // Move player
      this.socket.emit("playerMovement", {
        x: newPosition.x,
        y: newPosition.y,
        r: newPosition.r,
      });
    }

    this.oldPosition = newPosition;
  }

  addPlayer(playerInfo: PlayerInfo) {
    this.player = this.playerFromInfo(playerInfo);
  }

  addOtherPlayer(playerInfo: PlayerInfo) {
    const otherPlayer = this.playerFromInfo(playerInfo);
    otherPlayer.setTint(0xff0000);
    this.otherPlayers.add(otherPlayer);
  }

  private playerFromInfo(playerInfo: PlayerInfo): Phaser.GameObjects.Sprite {
    return this.add
      .sprite(playerInfo.x, playerInfo.y, "player")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(27, 50)
      .setData("playerId", playerInfo.playerId);
  }
}
