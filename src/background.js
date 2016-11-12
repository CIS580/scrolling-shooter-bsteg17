"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Background
 * A class representing a player's helicopter
 */
module.exports = exports = Background;

/**
 * @constructor Background
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Background(imgSrc, speed) {
  this.canvas = document.getElementById("screen");
  this.ctx = this.canvas.getContext('2d'); 
  this.image = new Image();
  this.image.src = "./assets/"+imgSrc;
  this.height = this.canvas.height;
  this.width = this.canvas.width;
  this.speed = speed;
  this.y = 0;
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Background.prototype.update = function(elapsedTime, input) {
  this.y += this.speed;
  if (this.y >= this.canvas.height) this.y = 0;
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Background.prototype.render = function(elapasedTime, ctx) {
  this.ctx.drawImage(this.image, 0, this.y, this.width, this.height); 
  this.ctx.drawImage(this.image, 0, this.y - this.height, this.width, this.height); 
}
