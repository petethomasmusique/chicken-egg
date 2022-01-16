import { Noise } from 'noisejs'
import { isOnCanvas, randInteger } from './utils'

const calculateRings = (x, y, height) => {
    let noise = new Noise(fxrand())
    const degree = 0.01
    let onCanvas = true
    let velocity = (fxrand() * 3)
    
    let rings = [{x, y}]
  
    while(onCanvas) {
        const lastItem = rings[rings.length - 1]
        const { x: lastX, y: lastY } = lastItem
        
        noise = lastX + velocity >= (height - (height/100)) || lastX + velocity <= 100 
            ? new Noise(fxrand())
            : noise
        
        velocity += noise.simplex2(lastX * degree, lastY * degree)
    
        const nextX = lastX + velocity
        const nextY = lastY - 4
        
        rings = [...rings, {x: nextX, y: nextY}]

        onCanvas = isOnCanvas(nextX, nextY, height)
    }
  
    return rings[rings.length - 1].y < 100 ? rings : calculateRings(x, y, height)
}

export const calculateTree = (num, p, x, height, floor) => {
    const startV = p.createVector(x, floor)
    let i = 0;
    let trunk = {start: 0, rings: calculateRings(startV.x, startV.y, height)}
    let tree = { 
        branches: [ trunk ]
    }
    
    while(i < num) {
        const { branches } = tree
        const prev = branches[branches.length - (Math.floor(fxrand() * branches.length) + 1)]
        const branchingIndex = Math.floor(prev.rings.length / 4)
        const seedIndex = randInteger(75, 100)
        const {x, y} = prev.rings[branchingIndex]
        const start = prev.start + branchingIndex
        const rings = calculateRings(x, y, height)
        const end = start + rings.length
        
        const branch = { start, end, rings, seedIndex }
        
        tree.branches = [...branches, branch]
        
        i++
    }

    return {
        ...tree,
        end: tree.branches.reduce((end, branch) => branch.end > end ? branch.end : end, 0)
    }
}