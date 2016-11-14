const BulletPool = require('./bullet_pool.js');
const Vector = require('./vector.js');
const SmokeParticles = require('./smoke_particles.js');

/* Constants */
const BULLET_SPEED = 10;

var bulletParticles = new SmokeParticles(500, [255, 255, 0]);
var laserParticles = new SmokeParticles(500, [0, 191, 255]);
var blastParticles = new SmokeParticles(500, [255, 69, 0]);

/**
 * @module Weapon
 * A class representing a player's helicopter
 */
module.exports = exports = Weapon;

/**
 * @constructor Weapon
 * Creates a player
 * @param {BulletPool} bullets the bullet pool
 */
function Weapon(type, player, camera) {
  this.type = type;
  this.player = player;
  this.camera = camera;
  this.bullets = new BulletPool(10);
  if (this.type == "bullet") {
    this.weaponCooldown = 300;
    this.cooldownElapsed = 300;
  }
  if (this.type == "laser") {
    this.laserX = 0;
    this.laserY = 0;
    this.laserTimer = 0;
    this.weaponCooldown = 1000;
    this.cooldownElapsed = 1000;
  }
  if (this.type == "blast") {
    this.weaponCooldown = 500;
    this.cooldownElapsed = 500;
  }
}

/**
 * @function update
 * Updates the player based on the supplied input
 * @param {DOMHighResTimeStamp} elapedTime
 * @param {Input} input object defining input, must have
 * boolean properties: up, left, right, down
 */
Weapon.prototype.update = function(elapsedTime, input) {
  var self = this;
  this.weaponUpdate(elapsedTime);
  if(this.cooldownElapsed >= this.weaponCooldown) {
    if(input.shoot) {
      this.fire();
      this.cooldownElapsed = 0;
    }
  } else {
    this.cooldownElapsed += elapsedTime;
  }
  // Update bullets
  this.bullets.update(elapsedTime, function(bullet){
    if(!self.camera.onScreen(bullet)) return true;
    return false;
  });
  bulletParticles.update(elapsedTime);
  laserParticles.update(elapsedTime);
}

Weapon.prototype.weaponUpdate = function(elapsedTime) {
  var self = this;
  switch(this.type) {
    case "bullet":
      break;
    case "laser":
      if(self.laserTimer > 0) {
        self.laserTimer -= elapsedTime;
      }
      break;
    case "blast":
      break;
  }
}

/**
 * @function render
 * Renders the player helicopter in world coordinates
 * @param {DOMHighResTimeStamp} elapsedTime
 * @param {CanvasRenderingContext2D} ctx
 */
Weapon.prototype.render = function(elapsedTime, ctx) {
  console.log("render");
  switch(this.type) {
    case "bullet":
      break;
    case "laser":
      if(this.laserTimer > 0) {
        var alpha = this.laserTimer / 1000;
        ctx.lineWidth = 5;
        ctx.strokeStyle = "rgba(0,191,255,"+alpha+")";
        ctx.beginPath();
        ctx.moveTo(this.laserX, this.laserY);
        ctx.lineTo(this.laserX, 0);
        ctx.stroke();
      }
      break;
    case "blast":
      break;
  }
  this.bullets.render(elapsedTime, ctx);
  bulletParticles.render(elapsedTime, ctx);
  laserParticles.render(elapsedTime, ctx);
}

Weapon.prototype.fire = function() {
  var self = this;
  switch(self.type) {
    case "bullet":
      self.fireBullet();
      break;
    case "laser":
      self.fireLaser();
      break;
    case "blast":
      self.fireBlast();
      break;
  }
}

/**
 * @function fireBullet
 * Fires a bullet
 * @param {Vector} direction
 */
Weapon.prototype.fireBullet = function() {
  var position = Vector.add(this.player.position, {x:0, y:0});
  var velocity = Vector.scale(Vector.normalize({x:0,y:-1}), BULLET_SPEED);
  bulletParticles.emit(this.player.position);
  this.bullets.add(position, velocity);
}

Weapon.prototype.fireLaser = function() {
  this.laserX = this.player.position.x;
  this.laserY = this.player.position.y;
  this.laserTimer = 1000;
  laserParticles.emit(this.player.position);
}

Weapon.prototype.fireBlast = function() {
  var self = this;
  [{x:-3,y:-5},{x:0,y:-1},{x:3,y:-5}].forEach(function(v){
    var position = Vector.add(self.player.position, {x:0, y:0});
    var velocity = Vector.scale(Vector.normalize(v), BULLET_SPEED);
    self.bullets.add(position, velocity);
  });
  bulletParticles.emit(this.player.position);
}

/**
 * @function fireMissile
 * Fires a missile, if the player still has missiles
 * to fire.
 */
Weapon.prototype.fireMissile = function() {
  if(this.missileCount > 0){
    var position = Vector.add(this.position, {x:0, y:30})
    var missile = new Missile(position);
    this.missiles.push(missile);
    this.missileCount--;
  }
}
