// ###################################################################
// Entities
//
// ###################################################################
const createBaseSprite = (_img, _x, _y) => {
  const img = _img
  const position = createPoint(_x, _y)
  const scale = createPoint(1, 1)
  let bounds = createRect(_x, _y, img.width, img.height)
  const doLogic = true
    
  const updateBounds = () => {
     bounds = createRect(
        position.x,
        position.y,
        Math.trunc(0.5 + img.width * scale.x),
        Math.trunc(0.5 + img.height * scale.y)
      )
  }
  const drawImage = () => {
    ctx.drawImage(img, position.x, position.y);
  }

  const draw = () => {
    updateBounds()
    drawImage()
  }
  
  return {
    img,
    scale,
    bounds,
    position,
    updateBounds,
    draw
  }
}

const createSheetSprite = (_sheetImg, _clipRect, _x, _y) => {
  const baseSprite = createBaseSprite(_sheetImg, _x, _y)
  const clipRect = _clipRect
  
  const updateBounds = baseSprite.updateBounds
  
  const drawImage = () => {
    ctx.save()
    ctx.transform(baseSprite.scale.x, 0, 0, baseSprite.scale.y, baseSprite.position.x, baseSprite.position.y)
    ctx.drawImage(baseSprite.img, clipRect.x, clipRect.y, clipRect.w, clipRect.h, Math.trunc(0.5 + -this.clipRect.w*0.5), Math.trunc(0.5 + -clipRect.h*0.5), clipRect.w, clipRect.h)
    ctx.restore()
  }
   
  const draw = baseSprite.draw
  
  return {
    bounds: baseSprite.bounds,
    position: baseSprite.position,
    clipRect,
    draw
  }
}

const createPlayer = () => {
  const PLAYER_CLIP_RECT = { x: 0, y: 204, w: 62, h: 32 }
  const sheetSprite = createSheetSprite(spriteSheetImg, PLAYER_CLIP_RECT, CANVAS_WIDTH/2, CANVAS_HEIGHT - 70)
  const scale = createPoint(0.85, 0.85)
  let lives = 3
  let xVel = 0
  const bullets = []
  let bulletDelayAccumulator = 0
  let score = 0
  
  const reset = () => {
    lives = 3;
    score = 0;
    sheetSprite.position = createPoint(CANVAS_WIDTH/2, CANVAS_HEIGHT - 70)
  }
  
  const shoot = () => {
    const bullet = createBullet(sheetSprite.position.x, sheetSprite.position.y - sheetSprite.bounds.h / 2, 1, 1000);
    bullets.push(bullet);
  }
  
  const handleInput = () => {
    if (isKeyDown(LEFT_KEY)) {
      xVel = -175;
    } else if (isKeyDown(RIGHT_KEY)) {
      xVel = 175;
    } else xVel = 0;
    
    if (wasKeyPressed(SHOOT_KEY)) {
      if (bulletDelayAccumulator > 0.5) {
        shoot(); 
        bulletDelayAccumulator = 0;
      }
    }
  }
  
  const updateBullets = dt => {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      if (bullet.alive) {
        bullet.update(dt);
      } else {
        bullets.splice(i, 1);
      }
    }
  }
  
  const update = (dt) => {
    // update time passed between shots
    bulletDelayAccumulator += dt;
    
    // apply x vel
    sheetSprite.position.x += xVel * dt;
    
    // cap player position in screen bounds
    sheetSprite.position.x = clamp(sheetSprite.position.x, sheetSprite.bounds.w/2, CANVAS_WIDTH - sheetSprite.bounds.w/2);
    updateBullets(dt);
  }
  
  const draw = (resized) => {
    sheetSprite.draw();

    // draw bullets
    for (let i = 0, len = bullets.length; i < len; i++) {
      const bullet = bullets[i];
      if (bullet.alive) {
        bullet.draw(resized);
      }
    }
  }

  return {
    lives,
    clipRect: sheetSprite.clipRect,
    bullets,
    draw,
    handleInput,
    update,
    reset
  }
}

const createBullet = (bulletImg, x, y, _direction, _speed) => {
  const baseSprite = createBaseSprite(bulletImg, x, y)
  const direction = _direction
  const speed = _speed
  let alive = true
  
  const update = (dt) => {
    baseSprite.position.y -= (speed * direction) * dt
    if (baseSprite.position.y < 0) {
      alive = false
    }
  }
  const draw = baseSprite.draw
  return {
    bounds: baseSprite.bounds,
    update,
    draw
  }
}

const createEnemy = (_clipRects, x, y) => {
  const sheetSprite = createSheetSprite(spriteSheetImg, _clipRects[0], x, y)
  let clipRects = _clipRects
  const scale = createPoint(0.5, 0.5)
  let alive = true
  let onFirstState = true
  const stepDelay = 1
  let stepAccumulator = 0
  let doShoot = false
  let bullet = null
  
  const toggleFrame =  () => {
    onFirstState = !onFirstState
    clipRect = onFirstState ? clipRects[0] : clipRects[1]
  }
  
  const shoot = () => {
    bullet = createBullet(sheetSprite.position.x, sheetSprite.position.y + sheetSprite.bounds.w/2, -1, 500)
  }
  
  const update = dt => {
    stepAccumulator += dt
    
    if (stepAccumulator >= stepDelay) {
      if (sheetSprite.position.x < sheetSprite.bounds.w/2 + 20 && alienDirection < 0) {
      updateAlienLogic = true
    } if (alienDirection === 1 && sheetSprite.position.x > CANVAS_WIDTH - sheetSprite.bounds.w/2 - 20) {
      updateAlienLogic = true;
    }
      if (sheetSprite.position.y > CANVAS_WIDTH - 50) {
        reset();
      }
      
      const fireTest = Math.floor(Math.random() * (stepDelay + 1));
      if (getRandomArbitrary(0, 1000) <= 5 * (stepDelay + 1)) {
        doShoot = true;
      }
      sheetSprite.position.x += 10 * alienDirection;
      toggleFrame();
      stepAccumulator = 0;
    }
    sheetSprite.position.y += alienYDown;
    
    if (bullet !== null && bullet.alive) {
      bullet.update(dt);  
    } else {
      bullet = null;
    }
  }
  
  const draw = () => {
    sheetSprite.draw()
    if (bullet !== null && bullet.alive) {
      bullet.draw();
    }
  }

  return {
    bullet,
    alive,
    draw,
    update
  }
}

const createParticleExplosion = () => {
  const particlePool = []
  const particles = []
  
  const draw = () => {
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i]
      particle.moves++;
	    particle.x += particle.xunits;
		  particle.y += particle.yunits + (particle.gravity * particle.moves);
			particle.life--;
			
			if (particle.life <= 0 ) {
				if (particlePool.length < 100) {
					particlePool.push(particles.splice(i,1));
				} else {
					particles.splice(i,1);
				}
			} else {
				ctx.globalAlpha = (particle.life)/(particle.maxLife);
				ctx.fillStyle = particle.color;
				ctx.fillRect(particle.x, particle.y, particle.width, particle.height);
				ctx.globalAlpha = 1;
			}
    }
  }
  
  const createExplosion = (x, y, color, number, width, height, spd, gravity, life) => {
    for (let i =0;i < number;i++) {
			const angle = Math.floor(Math.random()*360);
			const speed = Math.floor(Math.random()*spd/2) + spd;	
			const maxLife = Math.floor(Math.random()*life)+life/2;
			const radians = angle * Math.PI/ 180;
			const xunits = Math.cos(radians) * speed;
			const yunits = Math.sin(radians) * speed;
				
			if (this.particlePool.length > 0) {
				const tempParticle = particlePool.pop();
				tempParticle.x = x;
				tempParticle.y = y;
				tempParticle.xunits = xunits;
				tempParticle.yunits = yunits;
				tempParticle.life = maxLife;
				tempParticle.color = color;
				tempParticle.width = width;
				tempParticle.height = height;
				tempParticle.gravity = gravity
				tempParticle.moves = 0;
				tempParticle.alpha = 1;
				tempParticle.maxLife = maxLife;
				particles.push(tempParticle);
			} else {
				particles.push({ x, y, xunits, yunits, life, color, width, height, gravity, moves: 0, alpha: 1, maxLife: life });
			}	
	
		}
  }

  return {
    draw
  }
}
