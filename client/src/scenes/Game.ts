import Phaser from "phaser";
import { io, Socket } from "socket.io-client";

import { PlayerInfo, PositionData } from "../../../shared/types";

export default class GameScene extends Phaser.Scene {
  socket!: Socket;
  player!: Phaser.GameObjects.Sprite;
  label!: Phaser.GameObjects.Sprite;
  otherPlayers!: Phaser.GameObjects.Group;
  labels!: Phaser.GameObjects.Group;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  moveSpeed: number;
  oldPosition!: PositionData;
  username: string = "";

  constructor() {
    super("GameScene");

    this.moveSpeed = 2;
  }

  preload() {
    this.load.image("player", "assets/player.png");
  }

  create() {
    // If no username exists then go back to login
    this.username = localStorage.getItem("username") || "";
    if (this.username.length === 0) {
      this.scene.start("IntroScene");
      return;
    }

    this.socket = io("http://localhost:4000", {
      auth: {
        username: this.username,
      },
    });
    this.otherPlayers = this.add.group();
    this.labels = this.add.group();
    this.cursors = this.input.keyboard.createCursorKeys();

    const self = this;

    // Losing connection to server
    this.socket.on("disconnect", (reason) => {
      if (self.player) {
        self.player.destroy();
      }
      self.otherPlayers.getChildren().forEach((otherPlayer) => {
        otherPlayer.destroy();
      });
      self.labels.getChildren().forEach((label) => {
        label.destroy();
      });

      this.scene.start("IntroScene");
      return;
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

    this.socket.on("playerDisconnected", (playerId) => {
      self.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerId === otherPlayer.getData("playerId")) {
          otherPlayer.destroy();
        }
      });

      self.labels.getChildren().forEach((label) => {
        if (playerId === label.getData("playerId")) {
          label.destroy();
        }
      });
    });

    this.socket.on("playerMoved", (playerInfo: PlayerInfo) => {
      self.otherPlayers.getChildren().forEach((otherPlayer) => {
        if (playerInfo.playerId === otherPlayer.getData("playerId")) {
          const otherPlayerObj = otherPlayer as Phaser.GameObjects.Sprite;

          otherPlayerObj
            .setRotation(playerInfo.rotation)
            .setPosition(playerInfo.x, playerInfo.y);

          const label = this.labels.getChildren()[
            parseInt(otherPlayerObj.getData("labelIndex"), 10)
          ] as Phaser.GameObjects.Sprite;
          if (label) {
            label.x = playerInfo.x;
            label.y = playerInfo.y - otherPlayerObj.height / 2;
          }
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

    const label = this.labels.getChildren()[
      parseInt(this.player.getData("labelIndex"), 10)
    ] as Phaser.GameObjects.Sprite;
    if (label) {
      label.x = this.player.x;
      label.y = this.player.y - this.player.height / 2;
    }
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
    const sprite = this.add
      .sprite(playerInfo.x, playerInfo.y, "player")
      .setOrigin(0.5, 0.5)
      .setDisplaySize(27, 50)
      .setData("playerId", playerInfo.playerId)
      .setData("labelIndex", this.labels.getLength());

    this.labels.add(
      this.add
        .text(
          playerInfo.x,
          playerInfo.y - sprite.height / 2,
          playerInfo.username,
          {
            font: "17px Arial",
            align: "center",
          }
        )
        .setOrigin(0.5, 0.5)
        .setData("playerId", playerInfo.playerId)
    );

    return sprite;
  }
}
