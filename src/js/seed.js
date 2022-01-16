const speed = 0.2
const friction = 0.7

export const makeSeed = (x, y, floor) => {
    return { x, y, dy: 0, r: 10, height: y, floor, isBouncing: true}
}

export const moveSeed = (seed => {
    let { y, dy, r, floor, height } = seed
    const isBouncing = height === 0 || floor - height > 2.5
    const isAtTheBottom = y > floor
    dy = isAtTheBottom ? -(Math.abs(dy)) * friction : dy + speed // + speed
    y = isBouncing ? y + dy : floor
    height = dy > 0 && dy < 0.1 ? y : height
    return { ...seed, dy, y, height, isBouncing, isAtTheBottom }
})