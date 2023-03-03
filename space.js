// ###################################################################
// Constants
//
// ###################################################################
var CANVAS_WIDTH = 640;
var CANVAS_HEIGHT = 640;
var LEFT_KEY = 37;
var RIGHT_KEY = 39;
var SHOOT_KEY = 88;
var TEXT_BLINK_FREQ = 500;


// ###################################################################
// Globals
//
// ###################################################################
var canvas = null
var ctx = null
var spriteSheetImg = null
var bulletImg = null
var keyStates = null
var prevKeyStates = null
var lastTime = 0
var player = null
var aliens = []
var particleManager = null
var updateAlienLogic = false
var alienDirection = -1
var alienYDown = 0
var alienCount = 0
var wave = 1
var hasGameStarted = false

// ###################################################################
// Initialization functions
//
// ###################################################################
function initCanvas() {
  // create our canvas and context
  canvas = document.getElementById('game-canvas')
  ctx = canvas.getContext('2d')
  
  // turn off image smoothing
  setImageSmoothing(false)
  
  // create our main sprite sheet img
  spriteSheetImg = new Image()
  const spriteSheetSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAEACAYAAAADRnAGAAACGUlEQVR42u3aSQ7CMBAEQIsn8P+/hiviAAK8zFIt5QbELiTHmfEYE3L9mZE9AAAAqAVwBQ8AAAD6THY5CgAAAKbfbPX3AQAAYBEEAADAuZrC6UUyfMEEAIBiAN8OePXnAQAAsLcmmKFPAQAAgHMbm+gbr3Sdo/LtcAAAANR6GywPAgBAM4D2JXAAABoBzBjA7AmlOx8AAEAzAOcDAADovTc4vQim6wUCABAYQG8QAADd4dPd2fRVYQAAANQG0B4HAABAawDnAwAA6AXgfAAAALpA2uMAAABwPgAAgPoAM9Ci/R4AAAD2dmqcEQIAIC/AiQGuAAYAAECcRS/a/cJXkUf2AAAAoBaA3iAAALrD+gIAAADY9baX/nwAAADNADwFAADo9YK0e5FMX/UFACA5QPSNEAAAAHKtCekmDAAAAADvBljtfgAAAGgMMGOrunvCy2uCAAAACFU6BwAAwF6AGQPa/XsAAADYB+B8AAAAtU+ItD4OAwAAAFVhAACaA0T7B44/BQAAANALwGMQAAAAADYO8If2+P31AgAAQN0SWbhFDwCAZlXgaO1xAAAA1FngnA8AACAeQPSNEAAAAM4CnC64AAAA4GzN4N9NSfgKEAAAAACszO26X8/X6BYAAAD0Anid8KcLAAAAAAAAAJBnwNEvAAAA9Jns1ygAAAAAAAAAAAAAAAAAAABAQ4COCENERERERERERBrnAa1sJuUVr3rsAAAAAElFTkSuQmCC'
  spriteSheetImg.src = spriteSheetSrc
  preDrawImages()

  // add event listeners and initially resize
  window.addEventListener('resize', resize)
  document.addEventListener('keydown', onKeyDown)
  document.addEventListener('keyup', onKeyUp)
}

function preDrawImages() {
  var canvas = drawIntoCanvas(2, 8, function(ctx) {
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  })
  bulletImg = new Image()
  bulletImg.src = canvas.toDataURL()
}

function setImageSmoothing(value) {
  this.ctx['imageSmoothingEnabled'] = value
  this.ctx['mozImageSmoothingEnabled'] = value
  this.ctx['oImageSmoothingEnabled'] = value
  this.ctx['webkitImageSmoothingEnabled'] = value
  this.ctx['msImageSmoothingEnabled'] = value
}

function initGame() {
  dirtyRects = []
  aliens = []
  player = createPlayer()
  particleManager = createParticleExplosion()
  setupAlienFormation()
  drawBottomHud()
}

function setupAlienFormation() {
  const alienBottomRow = [ { x: 0, y: 0, w: 51, h: 34 }, { x: 0, y: 102, w: 51, h: 34 }]
  const alienMiddleRow = [ { x: 0, y: 137, w: 50, h: 33 }, { x: 0, y: 170, w: 50, h: 34 }]
  const alienTopRow = [ { x: 0, y: 68, w: 50, h: 32 }, { x: 0, y: 34, w: 50, h: 32 }]
  const alienXMargin = 40
  const alienSquadWidth = 11 * alienXMargin
  alienCount = 0
  for (let i = 0, len = 5 * 11; i < len; i++) {
    const gridX = (i % 11)
    const gridY = Math.floor(i / 11)
    let clipRects
    switch (gridY) {
      case 0: 
      case 1: clipRects = alienBottomRow; break;
      case 2: 
      case 3: clipRects = alienMiddleRow; break;
      case 4: clipRects = alienTopRow; break;
    }
    aliens.push(createEnemy(clipRects, (CANVAS_WIDTH/2 - alienSquadWidth/2) + alienXMargin/2 + gridX * alienXMargin, CANVAS_HEIGHT/3.25 - gridY * 40))
    alienCount++
  }
}

function reset() {
  aliens = []
  setupAlienFormation()
  player.reset()
}

function init() {
  initCanvas();
  keyStates = [];
  prevKeyStates = [];
  resize();
}

// ###################################################################
// Helpful input functions
//
// ###################################################################
function isKeyDown(key) {
  return keyStates[key];
}

function wasKeyPressed(key) {
  return !prevKeyStates[key] && keyStates[key];
}


// ###################################################################
// Drawing & Update functions
//
// ###################################################################
function updateAliens(dt) {
  if (updateAlienLogic) {
    updateAlienLogic = false;
    alienDirection = -alienDirection;
    alienYDown = 25;
  }
  
  for (var i = aliens.length - 1; i >= 0; i--) {
    var alien = aliens[i]
    if (!alien.alive) {
      aliens.splice(i, 1);
      alien = null
      alienCount--
      if (alienCount < 1) {
        wave++
        setupAlienFormation()
      }
      return
    }
    
    alien.stepDelay = ((alienCount * 20) - (wave * 10)) / 1000
    if (alien.stepDelay <= 0.05) {
      alien.stepDelay = 0.05
    }
    alien.update(dt)
    
    if (alien.doShoot) {
      alien.doShoot = false
      alien.shoot()
    }
  }
  alienYDown = 0
}

function resolveBulletEnemyCollisions() {
  var bullets = player.bullets
  
  for (var i = 0, len = bullets.length; i < len; i++) {
    var bullet = bullets[i]
    for (var j = 0, alen = aliens.length; j < alen; j++) {
      var alien = aliens[j]
      if (checkRectCollision(bullet.bounds, alien.bounds)) {
        alien.alive = bullet.alive = false
        particleManager.createExplosion(alien.position.x, alien.position.y, 'white', 70, 5,5,3,.15,50)
        player.score += 25
      }
    }
  }
}

function resolveBulletPlayerCollisions() {
  for (var i = 0, len = aliens.length; i < len; i++) {
    var alien = aliens[i]
    if (alien.bullet !== null && checkRectCollision(alien.bullet.bounds, player.bounds)) {
      if (player.lives === 0) {
        hasGameStarted = false
      } else {
        alien.bullet.alive = false
        particleManager.createExplosion(player.position.x, player.position.y, 'green', 100, 8,8,6,0.001,40)
        player.position = Point2D(CANVAS_WIDTH/2, CANVAS_HEIGHT - 70)
        player.lives--
        break
      }

    }
  }
}

function resolveCollisions() {
  resolveBulletEnemyCollisions()
  resolveBulletPlayerCollisions()
}

function updateGame(dt) {
  player.handleInput()
  prevKeyStates = keyStates.slice()
  player.update(dt)
  updateAliens(dt)
  resolveCollisions()
}

function drawIntoCanvas(width, height, drawFunc) {
  var canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  var ctx = canvas.getContext('2d')
  drawFunc(ctx)
  return canvas
}

function fillText(text, x, y, color, fontSize) {
  if (typeof color !== 'undefined') ctx.fillStyle = color
  if (typeof fontSize !== 'undefined') ctx.font = fontSize + 'px Play'
  ctx.fillText(text, x, y)
}

function fillCenteredText(text, x, y, color, fontSize) {
  var metrics = ctx.measureText(text)
  fillText(text, x - metrics.width/2, y, color, fontSize)
}

function fillBlinkingText(text, x, y, blinkFreq, color, fontSize) {
  if (~~(0.5 + Date.now() / blinkFreq) % 2) {
    fillCenteredText(text, x, y, color, fontSize)
  }
}

function drawBottomHud() {
  ctx.fillStyle = '#02ff12'
  ctx.fillRect(0, CANVAS_HEIGHT - 30, CANVAS_WIDTH, 2)
  fillText(player.lives + ' x ', 10, CANVAS_HEIGHT - 7.5, 'white', 20)
  ctx.drawImage(spriteSheetImg, player.clipRect.x, player.clipRect.y, player.clipRect.w, 
                 player.clipRect.h, 45, CANVAS_HEIGHT - 23, player.clipRect.w * 0.5,
                 player.clipRect.h * 0.5)
  fillText('CREDIT: ', CANVAS_WIDTH - 115, CANVAS_HEIGHT - 7.5)
  fillCenteredText('SCORE: ' + player.score, CANVAS_WIDTH/2, 20)
  fillBlinkingText('00', CANVAS_WIDTH - 25, CANVAS_HEIGHT - 7.5, TEXT_BLINK_FREQ)
}

function drawAliens(resized) {
  for (var i = 0; i < aliens.length; i++) {
    var alien = aliens[i]
    alien.draw(resized)
  }
}

function drawGame(resized) {
  player.draw(resized)
  drawAliens(resized)
  particleManager.draw()
  drawBottomHud()
}

function drawStartScreen() {
  fillCenteredText("Space Invaders", CANVAS_WIDTH/2, CANVAS_HEIGHT/2.75, '#FFFFFF', 36)
  fillBlinkingText("Press enter to play!", CANVAS_WIDTH/2, CANVAS_HEIGHT/2, 500, '#FFFFFF', 36)
}

function animate() {
  var now = window.performance.now()
  var dt = now - lastTime
  if (dt > 100) dt = 100
  if (wasKeyPressed(13) && !hasGameStarted) {
    initGame()
    hasGameStarted = true
  }
  
  if (hasGameStarted) {
     updateGame(dt / 1000)
  }
 
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  if (hasGameStarted) {
    drawGame(false)
  } else {
    drawStartScreen()
  }
  lastTime = now
  requestAnimationFrame(animate)
}



// ###################################################################
// Event Listener functions
//
// ###################################################################
function resize() {
  var w = window.innerWidth
  var h = window.innerHeight

	// calculate the scale factor to keep a correct aspect ratio
  var scaleFactor = Math.min(w / CANVAS_WIDTH, h / CANVAS_HEIGHT)
  
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
  if (isChrome) {
    canvas.width = CANVAS_WIDTH * scaleFactor
    canvas.height = CANVAS_HEIGHT * scaleFactor
    setImageSmoothing(false)
    ctx.transform(scaleFactor, 0, 0, scaleFactor, 0, 0) 
  } else {
    // resize the canvas css properties
    canvas.style.width = CANVAS_WIDTH * scaleFactor + 'px'
    canvas.style.height = CANVAS_HEIGHT * scaleFactor + 'px'
  }
}

function onKeyDown(e) {
  e.preventDefault()
  keyStates[e.keyCode] = true
}

function onKeyUp(e) {
  e.preventDefault()
  keyStates[e.keyCode] = false
}


// ###################################################################
// Start game!
//
// ###################################################################
window.onload = function() {
  init()
  // animate()
}