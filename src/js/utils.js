export const scale = (inMax, inMin, outMax, outMin, number) => {
	var percent = (number - inMin) / (inMax - inMin);
	let val = percent * (outMax - outMin) + outMin;
    return val < outMin 
        ? outMin
        : val > outMax
            ? outMax
            : val
}

export function max(a, b) {
    return a >= b ? a : b
}
export function maxArray(array) {
    return array.reduce(max, 0)
}

export function min(a, b) { 
    return a <= b ? a : b
}

export function minArray(array) {
    return array.reduce(min, 0)
}

export function diff(a, b) { 
    return Math.abs(a - b)
}
export function diffArray(array) {
    return diff(maxArray(array), minArray(array))
}

export function generateSeeds(num) {
    const seeds = Array.from(Array(num)).map(i => fxrand())
    return diffArray(seeds) < 0.75 ? generateSeeds(num) : seeds
}

export const sum = (a, b) => a + b
export const sumArray = (array) => array.reduce(sum)

export const avArray = (array) => sumArray(array)/(array.length)
export const medianArray = array => minArray(array) + (diffArray(array))


function formatPoints(points, close) {
    points = [...points];
  
    if (!Array.isArray(points[0])) {
        points = points.map(({ x, y }) => [x, y]);
    }
  
    if (close) {
        const lastPoint = points[points.length - 1];
        const secondToLastPoint = points[points.length - 2];
    
        const firstPoint = points[0];
        const secondPoint = points[1];
    
        points.unshift(lastPoint);
        points.unshift(secondToLastPoint);
    
        points.push(firstPoint);
        points.push(secondPoint);
    }
  
    return points.flat();
}
  
export const spline = (points = [], tension = 1, close = false, cb) => {
    points = formatPoints(points, close);
  
    const size = points.length;
    const last = size - 4;
  
    const startPointX = close ? points[2] : points[0];
    const startPointY = close ? points[3] : points[1];
  
    let path = "M" + [startPointX, startPointY];
  
    cb && cb("MOVE", [startPointX, startPointY]);
  
    const startIteration = close ? 2 : 0;
    const maxIteration = close ? size - 4 : size - 2;
    const inc = 2;
  
    for (let i = startIteration; i < maxIteration; i += inc) {
        const x0 = i ? points[i - 2] : points[0];
        const y0 = i ? points[i - 1] : points[1];
    
        const x1 = points[i + 0];
        const y1 = points[i + 1];
    
        const x2 = points[i + 2];
        const y2 = points[i + 3];
    
        const x3 = i !== last ? points[i + 4] : x2;
        const y3 = i !== last ? points[i + 5] : y2;
    
        const cp1x = x1 + ((x2 - x0) / 6) * tension;
        const cp1y = y1 + ((y2 - y0) / 6) * tension;
    
        const cp2x = x2 - ((x3 - x1) / 6) * tension;
        const cp2y = y2 - ((y3 - y1) / 6) * tension;
    
        path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    
        cb && cb("CURVE", [cp1x, cp1y, cp2x, cp2y, x2, y2]);
    }
  
    return path;
}

export function gaussianRandom() {
    let u = 0, v = 0;
    while(u === 0) u = fxrand(); //Converting [0,1) to (0,1)
    while(v === 0) v = fxrand();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm(); // resample between 0 and 1
    return num;
}

export function rgbWrapper(index, value) {
    const vals = [255,255,255]
    vals[index] = value
    return `rgb(${vals.join(',')})`
}

export const isOnCanvas = (x, y, size) => x > 0 && x < size && y > 0 && y < size

export const randInteger = (min, max) => Math.floor(fxrand() * (max - min)) + min

export const isEven = val => val % 2 === 0
export const isOdd = val => !isEven(val)