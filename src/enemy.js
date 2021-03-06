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
function Enemy(position, type, options) {
  this.canvas = document.getElementById("screen");
  this.angle = 0;
  this.position = position;
  this.width  = 23;
  this.height = 27;
  this.health = 100;
  this.img = new Image();
  //this.img.src = this.getSkin();
  this.initForType(type, options);
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

Enemy.prototype.initForType = function(type, options) {
  self = this;
  switch(type){
    case "spinny":
      self.initSpinny();
      break;
    case "divebomb":
      self.initDivebomb(options);
      break;
    case "zigzag":
      self.initZigZag(options);
      break;
    case "encircle":
      self.initEncircle(options);
      break;
  }
}

Enemy.prototype.initSpinny = function() {
  this.type = "spinny";
  this.timer = 0;
  this.centerOfSpin = {x: this.position.x, y: this.position.y};
  this.radians = 0;
  this.radius = 20;
}

Enemy.prototype.initDivebomb  = function(options) {
  this.type = "divebomb";
  this.divebombSpeed = 10;
  this.divebombPosition = options.divebombPosition;
  this.divebombing = false;
}

Enemy.prototype.initZigZag = function(options) {
  this.type = "zigzag";
  this.screenProgress = options.screenProgress;
  if (this.screenProgress == "horizontal") {
    this.horizontalSpeed = 5;
    this.verticalSpeed = 20;
  }
  else if (this.screenProgress == "vertical") {
    this.horizontalSpeed = 20;
    this.verticalSpeed = 5;
  }
  this.direction = 1;
}

Enemy.prototype.initEncircle = function(options) {
  this.type = "encircle";
  this.radius = options.radius;
  this.centerOfCircle = {x: this.canvas.width / 2, y: this.canvas.height / 2};
  this.encircleStart = {x: this.centerOfCircle.x, y: this.centerOfCircle.y - this.radius};
  this.exitSpeed = 15;
  this.radians = -Math.PI * .5;
  this.encircling = false;
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
  if(this.position.y > this.canvas.height || this.position.x > this.canvas.width) this.destroy(enemies);
  //console.log(enemies);
}

Enemy.prototype.updateForType = function() {
  self = this;
  switch(self.type) {
    case "spinny":
      self.spinnyUpdate();
      break;
    case "divebomb":
      self.divebombUpdate();
      break;
    case "zigzag":
      self.zigZagUpdate();
      break;
    case "encircle":
      self.encircleUpdate();
      break;
  }
}

Enemy.prototype.spinnyUpdate = function() {
  this.position.x = this.centerOfSpin.x + (Math.cos(this.radians) * this.radius);
  this.position.y = this.centerOfSpin.y + (Math.sin(this.radians) * this.radius);
  this.radians += .2;
  this.centerOfSpin.y += 10;
}

Enemy.prototype.divebombUpdate = function() {
  if (this.position.y >= this.divebombPosition.y) this.divebombing = true;
  if(!this.divebombing) {
    //this.position = Vector.add(this.position, Vector.normalize(Vector.subtract(this.position, this.divebombPosition)) * 5);
    this.position = Vector.add(this.position, Vector.scale(Vector.normalize(Vector.subtract(this.divebombPosition, this.position)), 5));
  } else {
    this.position.y += this.divebombSpeed;
  }
}

Enemy.prototype.zigZagUpdate = function() {
  switch(this.screenProgress) {
    case "vertical":
      if (this.position.x < 0 || this.canvas.width < (this.position.x + this.width)) this.direction *= -1;
      this.position.x += this.horizontalSpeed * this.direction;
      this.position.y += this.verticalSpeed;
      break;
    case "horizontal":
      if (this.position.y < 0 || this.canvas.height < (this.position.y + this.height)) this.direction *= -1;
      this.position.x += this.horizontalSpeed;
      this.position.y += this.verticalSpeed * this.direction;
      break;
  }
}

Enemy.prototype.encircleUpdate = function() {
  console.log(this.position);
  if(this.position.y >= this.encircleStart.y) this.encircling = true;
  if(this.radians >= Math.PI * 7.5) {
    this.position.y += this.exitSpeed;
    return;
  }
  if(!this.encircling) {
    this.position = Vector.add(this.position, Vector.scale(Vector.normalize(Vector.subtract(this.encircleStart, this.position)), 5));
    return;
  }
  this.position.x = this.centerOfCircle.x + (Math.cos(this.radians) * this.radius);
  this.position.y = this.centerOfCircle.y + (Math.sin(this.radians) * this.radius);
  this.radians += .2;
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
  ctx.fillRect(-12.5, -12, this.width, this.height);
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
