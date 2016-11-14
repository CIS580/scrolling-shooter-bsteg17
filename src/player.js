"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');
const SmokeParticles = require('./smoke_particles.js');

/* Constants */
const PLAYER_SPEED = 10;
const BULLET_SPEED = 10;

var bulletParticles = new SmokeParticles(500, [255, 255, 0]);
var laserParticles = new SmokeParticles(500, [0, 191, 255]);
var blastParticles = new SmokeParticles(500, [255, 69, 0]);


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
function Player(bullets, missiles) {
  this.missiles = missiles;
  this.missileCount = 4;
  this.bullets = bullets;
  this.laserX = 0;
  this.laserY = 0;
  this.laserTimer = 0;
  this.angle = 0;
  this.position = {x: 200, y: 200};
  this.velocity = {x: 0, y: 0};
  this.health = 100;
  this.img = new Image()
  this.img.src = 'assets/tyrian.shp.007D3C.png';
  this.weaponCooldown = 300;
  this.cooldownElapsed = 300;
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
  if(this.cooldownElapsed >= this.weaponCooldown) {
    if(input.shoot) {
      //this.fireBullet({x:0, y:-50});
      //this.fireLaser();
      this.fireBlast();
      this.cooldownElapsed = 0;
    }
  } else {
    this.cooldownElapsed += elapsedTime;
  }

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

  bulletParticles.update(elapsedTime);
  laserParticles.update(elapsedTime);
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
  bulletParticles.render(elapsedTime, ctx);
  laserParticles.render(elapsedTime, ctx);
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Player.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x:0, y:0});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  bulletParticles.emit(this.position);
  this.bullets.add(position, velocity);
}

Player.prototype.fireLaser = function() {
  this.laserX = this.position.x;
  this.laserY = this.position.y;
  this.laserTimer = 1000;
  laserParticles.emit(this.position);
}

Player.prototype.fireBlast = function() {
  var self = this;
  [{x:-3,y:-5},{x:0,y:-1},{x:3,y:-5}].forEach(function(v){
    var position = Vector.add(self.position, {x:0, y:0});
    var velocity = Vector.scale(Vector.normalize(v), BULLET_SPEED);
    self.bullets.add(position, velocity);
  });
  bulletParticles.emit(this.position);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Player.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}
