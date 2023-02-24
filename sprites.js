// ###################################################################
// Entities
//
// ###################################################################
var BaseSprite = Class.extend({
  init: function(img, x, y) {
    this.img = img;
    this.position = Point2D(x, y);
    this.scale = Point2D(1, 1);
    this.bounds = Rect(x, y, this.img.width, this.img.height);
    this.doLogic = true;
  },
                           
  update: function(dt) { },
  
  _updateBounds: function() {
     this.bounds = Rect(this.position.x, this.position.y, Math.trunc(0.5 + this.img.width * this.scale.x), Math.trunc(0.5 + this.img.height * this.scale.y));
  },
  
  _drawImage: function() {
    ctx.drawImage(this.img, this.position.x, this.position.y);
  },
  
  draw: function(resized) {
    this._updateBounds();
    
    this._drawImage();
  }
});

var SheetSprite = BaseSprite.extend({
  init: function(sheetImg, clipRect, x, y) {
    this._super(sheetImg, x, y);
    this.clipRect = clipRect;
    this.bounds = Rect(x, y, this.clipRect.w, this.clipRect.h);
  },
  
  update: function(dt) {},
  
  _updateBounds: function() {
    var w = ~~(0.5 + this.clipRect.w * this.scale.x);
    var h = ~~(0.5 + this.clipRect.h * this.scale.y);
    this.bounds = Rect(this.position.x - w/2, this.position.y - h/2, w, h);
  },
  
  _drawImage: function() {
    ctx.save();
    ctx.transform(this.scale.x, 0, 0, this.scale.y, this.position.x, this.position.y);
    ctx.drawImage(this.img, this.clipRect.x, this.clipRect.y, this.clipRect.w, this.clipRect.h, ~~(0.5 + -this.clipRect.w*0.5), ~~(0.5 + -this.clipRect.h*0.5), this.clipRect.w, this.clipRect.h);
    ctx.restore();

  },
  
  draw: function(resized) {
    this._super(resized);
  }
});

var Player = SheetSprite.extend({
  init: function() {
    this._super(spriteSheetImg, PLAYER_CLIP_RECT, CANVAS_WIDTH/2, CANVAS_HEIGHT - 70);
    this.scale = Point2D(0.85, 0.85);
    this.lives = 3;
    this.xVel = 0;
    this.bullets = [];
    this.bulletDelayAccumulator = 0;
    this.score = 0;
  },
  
  reset: function() {
    this.lives = 3;
    this.score = 0;
    this.position = Point2D(CANVAS_WIDTH/2, CANVAS_HEIGHT - 70);
  },
  
  shoot: function() {
    var bullet = new Bullet(this.position.x, this.position.y - this.bounds.h / 2, 1, 1000);
    this.bullets.push(bullet);
  },
  
  handleInput: function() {
    if (isKeyDown(LEFT_KEY)) {
      this.xVel = -175;
    } else if (isKeyDown(RIGHT_KEY)) {
      this.xVel = 175;
    } else this.xVel = 0;
    
    if (wasKeyPressed(SHOOT_KEY)) {
      if (this.bulletDelayAccumulator > 0.5) {
        this.shoot(); 
        this.bulletDelayAccumulator = 0;
      }
    }
  },
  
  updateBullets: function(dt) {
    for (var i = this.bullets.length - 1; i >= 0; i--) {
      var bullet = this.bullets[i];
      if (bullet.alive) {
        bullet.update(dt);
      } else {
        this.bullets.splice(i, 1);
        bullet = null;
      }
    }
  },
  
  update: function(dt) {
    // update time passed between shots
    this.bulletDelayAccumulator += dt;
    
    // apply x vel
    this.position.x += this.xVel * dt;
    
    // cap player position in screen bounds
    this.position.x = clamp(this.position.x, this.bounds.w/2, CANVAS_WIDTH - this.bounds.w/2);
    this.updateBullets(dt);
  },
  
  draw: function(resized) {
    this._super(resized);

    // draw bullets
    for (var i = 0, len = this.bullets.length; i < len; i++) {
      var bullet = this.bullets[i];
      if (bullet.alive) {
        bullet.draw(resized);
      }
    }
  }
});

var Bullet = BaseSprite.extend({
  init: function(x, y, direction, speed) {
    this._super(bulletImg, x, y);
    this.direction = direction;
    this.speed = speed;
    this.alive = true;
  },
  
  update: function(dt) {
    this.position.y -= (this.speed * this.direction) * dt;
    
    if (this.position.y < 0) {
      this.alive = false;
    }
  },
  
  draw: function(resized) {
    this._super(resized);
  }
});

var Enemy = SheetSprite.extend({
  init: function(clipRects, x, y) {
    this._super(spriteSheetImg, clipRects[0], x, y);
    this.clipRects = clipRects;
    this.scale = Point2D(0.5, 0.5);
    this.alive = true;
    this.onFirstState = true;
    this.stepDelay = 1; // try 2 secs to start with...
    this.stepAccumulator = 0;
    this.doShoot - false;
    this.bullet = null;
  },
  
  toggleFrame: function() {
    this.onFirstState = !this.onFirstState;
    this.clipRect = (this.onFirstState) ? this.clipRects[0] : this.clipRects[1];
  },
  
  shoot: function() {
    this.bullet = new Bullet(this.position.x, this.position.y + this.bounds.w/2, -1, 500);
  },
  
  update: function(dt) {
    this.stepAccumulator += dt;
    
    if (this.stepAccumulator >= this.stepDelay) {
      if (this.position.x < this.bounds.w/2 + 20 && alienDirection < 0) {
      updateAlienLogic = true;
    } if (alienDirection === 1 && this.position.x > CANVAS_WIDTH - this.bounds.w/2 - 20) {
      updateAlienLogic = true;
    }
      if (this.position.y > CANVAS_WIDTH - 50) {
        reset();
      }
      
      var fireTest = Math.floor(Math.random() * (this.stepDelay + 1));
      if (getRandomArbitrary(0, 1000) <= 5 * (this.stepDelay + 1)) {
        this.doShoot = true;
      }
      this.position.x += 10 * alienDirection;
      this.toggleFrame();
      this.stepAccumulator = 0;
    }
    this.position.y += alienYDown;
    
    if (this.bullet !== null && this.bullet.alive) {
      this.bullet.update(dt);  
    } else {
      this.bullet = null;
    }
  },
  
  draw: function(resized) {
    this._super(resized);
    if (this.bullet !== null && this.bullet.alive) {
      this.bullet.draw(resized);
    }
  }
});

var ParticleExplosion = Class.extend({
  init: function() {
    this.particlePool = [];
    this.particles = [];
  },
  
  draw: function() {
    for (var i = this.particles.length - 1; i >= 0; i--) {
      var particle = this.particles[i];
      particle.moves++;
	    particle.x += particle.xunits;
		  particle.y += particle.yunits + (particle.gravity * particle.moves);
			particle.life--;
			
			if (particle.life <= 0 ) {
				if (this.particlePool.length < 100) {
					this.particlePool.push(this.particles.splice(i,1));
				} else {
					this.particles.splice(i,1);
				}
			} else {
				ctx.globalAlpha = (particle.life)/(particle.maxLife);
				ctx.fillStyle = particle.color;
				ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
				ctx.globalAlpha = 1;
			}
    }
  },
  
  createExplosion: function(x, y, color, number, width, height, spd, grav, lif) {
  for (var i =0;i < number;i++) {
			var angle = Math.floor(Math.random()*360);
			var speed = Math.floor(Math.random()*spd/2) + spd;	
			var life = Math.floor(Math.random()*lif)+lif/2;
			var radians = angle * Math.PI/ 180;
			var xunits = Math.cos(radians) * speed;
			var yunits = Math.sin(radians) * speed;
				
			if (this.particlePool.length > 0) {
				var tempParticle = this.particlePool.pop();
				tempParticle.x = x;
				tempParticle.y = y;
				tempParticle.xunits = xunits;
				tempParticle.yunits = yunits;
				tempParticle.life = life;
				tempParticle.color = color;
				tempParticle.width = width;
				tempParticle.height = height;
				tempParticle.gravity = grav;
				tempParticle.moves = 0;
				tempParticle.alpha = 1;
				tempParticle.maxLife = life;
				this.particles.push(tempParticle);
			} else {
				this.particles.push({x:x,y:y,xunits:xunits,yunits:yunits,life:life,color:color,width:width,height:height,gravity:grav,moves:0,alpha:1, maxLife:life});
			}	
	
		}
  }
});
