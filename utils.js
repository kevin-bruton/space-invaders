// ###################################################################
// Utility functions & classes
//
// ###################################################################
const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min
}

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const clamp = (num, min, max) => {
  return Math.min(Math.max(num, min), max)
}

const valueInRange = (value, min, max) => {
  return (value <= max) && (value >= min)
}

const checkRectCollision = (A, B) => {
  const xOverlap = valueInRange(A.x, B.x, B.x + B.w) || valueInRange(B.x, A.x, A.x + A.w)
  const yOverlap = valueInRange(A.y, B.y, B.y + B.h) || valueInRange(B.y, A.y, A.y + A.h)
  return xOverlap && yOverlap
}

const Point2D = (x, y) => ({
  x: x === undefined ? 0 : x,
  y: y === undefined ? 0 : y
})

const Rect = (x, y, w, h) => ({
  x: x === undefined ? 0 : x,
  y: y === undefined ? 0 : y,
  w: w === undefined ? 0 : w,
  h: h === undefined ? 0 : h
})
