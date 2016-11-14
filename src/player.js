"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');
const Weapon = require('./weapon');
const SmokeParticles = require('./smoke_particles.js');

/* Constants */
const PLAYER_SPEED = 10;
const BULLET_SPEED = 10;



/**
 * @module Player
 * A class representing a player's helicopter
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Player(camera) {
  this.angle = 0;
  this.position = {x: 200, y: 200};
  this.velocity = {x: 0, y: 0};
  this.health = 100;
  this.img = new Image();
  this.img.src = 'assets/tyrian.shp.007D3C.png';
  this.weapon = new Weapon("blast", this, camera);
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Player.prototype.update = function(elapsedTime, input) {

  if(this.laserTimer > 0) {
    this.laserTimer -= elapsedTime;
  }

  // set the velocity
  this.velocity.x = 0;
  if(input.left) this.velocity.x -= PLAYER_SPEED;
  if(input.right) this.velocity.x += PLAYER_SPEED; this.velocity.y = 0; if(input.up) this.velocity.y -= PLAYER_SPEED / 2;
  if(input.down) this.velocity.y += PLAYER_SPEED / 2;

  // determine player angle
  this.angle = 0;
  if(this.velocity.x < 0) this.angle = -1;
  if(this.velocity.x > 0) this.angle = 1;

  // move the player
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  // don't let the player move off-screen
  if(this.position.x < 0) this.position.x = 0;
  if(this.position.x > 1024) this.position.x = 1024;
  if(this.position.y > 786) this.position.y = 786;


  this.weapon.update(elapsedTime, input);
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Player.prototype.render = function(elapsedTime, ctx) {
  var offset = this.angle * 23;
  if(this.laserTimer > 0) {
    var alpha = this.laserTimer / 1000;
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(0,191,255,"+alpha+")";
    ctx.beginPath();
    ctx.moveTo(this.laserX, this.laserY);
    ctx.lineTo(this.laserX, 0);
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.drawImage(this.img, 48+offset, 57, 23, 27, -12.5, -12, 23, 27);
  ctx.restore();
  this.weapon.render(elapsedTime, ctx);
}
