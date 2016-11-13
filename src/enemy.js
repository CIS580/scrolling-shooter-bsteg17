"use strict";

/* Classes and Libraries */
const Vector = require('./vector');
const Missile = require('./missile');

/* Constants */
const PLAYER_SPEED = 5;
const BULLET_SPEED = 10;

/**
 * @module Enemy
 * A class representing a enemy's helicopter
 */
module.exports = exports = Enemy;

/**
 * @constructor Enemy
 * Creates a enemy
 * @param {BulletPool} bullets the bullet pool
 */
function Enemy(bullets, position, type) {
  this.canvas = document.getElementById("screen");
  this.bullets = bullets;
  this.angle = 0;
  this.position = position;
  this.health = 100;
  this.img = new Image();
  //this.img.src = this.getSkin();
  this.timer = 0;
  this.initForType(type);
}

Enemy.prototype.getSkin = function(type) {
  var skin;
  switch(type) {
    case "spinny":
      skin = "./assets/spinny.png";
      break;
  }
  return skin;
}

Enemy.prototype.initForType = function(type) {
  self = this;
  switch(type){
    case "spinny":
      self.initSpinny();
  }
}

Enemy.prototype.initSpinny = function() {
  this.type = "spinny";
  this.centerOfSpin = {x: this.position.x, y: this.position.y};
  this.radians = 0;
  this.radius = 20;
}

/**
 * @function update
 * Updates the enemy based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Enemy.prototype.update = function(elapsedTime, enemies) {
  
  //enemy behavior determines movement
  this.updateForType();

  // kill enemy once they move offscreen 
  if(this.position.y > this.canvas.height) this.destroy(enemies);
}

Enemy.prototype.updateForType = function() {
  self = this;
  switch(self.type) {
    case "spinny":
      self.spinnyUpdate();
      break;
  }
}

Enemy.prototype.spinnyUpdate = function() {
  this.position.x = this.centerOfSpin.x + (Math.cos(this.radians) * this.radius);
  this.position.y = this.centerOfSpin.y + (Math.sin(this.radians) * this.radius);
  this.radians += .2;
  this.centerOfSpin.y += 10;
}

/**
 * @function render
 * Renders the enemy helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Enemy.prototype.render = function(elapasedTime, ctx) {
  var offset = this.angle * 23;
  ctx.save();
  ctx.translate(this.position.x, this.position.y);
  ctx.fillStyle = "yellow";
  ctx.fillRect(-12.5, -12, 23, 27);
  //ctx.drawImage(this.img, 48+offset, 57, 23, 27, -12.5, -12, 23, 27);
  ctx.restore();
}

Enemy.prototype.destroy = function(enemies) {
  enemies.splice(enemies.indexOf(this), 1);
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Enemy.prototype.fireBullet = function(direction) {
  var position = Vector.add(this.position, {x:0, y:0});
  var velocity = Vector.scale(Vector.normalize(direction), BULLET_SPEED);
  this.bullets.add(position, velocity);
}

/**
 * @function fireMissile
 * Fires a missile, if the enemy still has missiles
 * to fire.
 */
Enemy.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}
