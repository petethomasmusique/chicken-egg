import p5 from 'p5'
import { calculateTree } from './js/tree';
import { makeSeed, moveSeed } from './js/seed';
import * as Tone from 'tone'
import { isOdd, scale } from './js/utils';
import WebMidi from 'webmidi';

const canvas = document.getElementById('container');
const frameRate = 32
const tFrameRate = 8
const height = canvas.getBoundingClientRect().height
const unit = (height/750)
const capture = true
const duration = 60 * 5.5 * frameRate

var capturer = new CCapture({ 
  format: 'png', 
  framerate: frameRate,
  autoSaveTime: 30,
});

WebMidi.enable()
// Channels 1 - 5 branches
// 6 - reset
// 7 - lightning
// 8+ balls

const sketch = (p) => {
  p.noiseSeed(99);
  
  let fade = 0.5
  const floor = height * (7/8) 
  let branches = 1
  let counter = 0
  let tCounter = 0 // tree counter

  const getTree = (x) => calculateTree(branches, p, x, height, floor)
  let tree = getTree(fxrand() * (height/2) + (height/4))
  let nextTree = getTree(fxrand() * (height/2) + (height/4))

  let seeds = {}

  function reset() {
    tCounter = 0
    tree = nextTree
    nextTree = false
    seeds = Object.values(seeds).reduce((newSeeds, seed, i) => {
      return {
        ...newSeeds,
        [i + 1]: seed && seed.isBouncing ? seed : null
      }
    }, {})
    fade = 0.5
    branches < 4 
      ? branches++
      : branches > 0 
        ? branches--
        : 1

    WebMidi.outputs[0].playNote(60, 6, { rawVelocity: true, velocity: 1});
  }
  
  p.setup = () => {
    p.createCanvas(height, height)
    p.frameRate(frameRate)
  }
  
  const draw = function() {
    p.background(0);
    if (counter === 1 && capture) {
      console.log('started recording.');
      capturer.start();
    }

    if (counter > duration && capture) {
      p.noLoop();
      console.log('finished recording.');
      capturer.stop();
      capturer.save();
      return;
    }
    
    const lightning = p.noise(counter)
    const flash = lightning > (1 - (counter/50000))
    flash && WebMidi.outputs[0].playNote(60, 7, { 
      rawVelocity: true, 
      velocity: lightning,
    });
    
    Object.values(seeds).length && Object.values(seeds).map((seed, i) => {
      if(!seed) return
      p.noStroke()
      p.fill(`rgba(255,255,255,${0.75})`)
      p.circle(seed.x, seed.y, seed.r)
      !seed.isBouncing && (nextTree = getTree(seed.x));
      seeds[i + 1] = seed.isBouncing ? moveSeed(seed) : seed;
      // Play note when hits the bottom from channels 8 onwards
      seed.isAtTheBottom && WebMidi.outputs[0].playNote(60, i + 8, { 
        rawVelocity: false, 
        velocity: Math.floor(scale(floor, 0, 127, 0, seed.height)),
      });
    })

    tree && tree.branches.map(({start, rings, seedIndex}, branchI) => {
      if(tCounter < start || fade <= 0.01) return

      rings.slice(0, tCounter - start).map((ring, i, array) => {
        i === seedIndex 
          && !!!seeds[branchI]
          && (seeds[branchI] = makeSeed(ring.x, ring.y, floor));

        const size = unit * (array.length - i) || 1
        
        // TODO - remove this on render?
        // if(size > 3 && isOdd(i)) return

        let alpha = flash 
          ? (1/height) * (ring.y)
          : (1/height) * (ring.y) * fade
        
        p.stroke(`rgba(255,255,255,${alpha})`);
        p.noFill()
        p.circle(ring.x, ring.y, size)
      })
    });
    
    if(counter % tFrameRate === 0) {
      tree && tree.branches.map(({start, rings}, i) => {
        if(tCounter < start || fade <= 0.01) return
        const lastRing = rings[tCounter - start] || rings[rings.length - 1]
        if(tCounter < tree.end) {
          // WebMidi.outputs[0].sendControlChange(1, Math.floor(scale(height, 0, 127, 0, lastRing.x)), i + 1)
          // WebMidi.outputs[0].sendControlChange(2, Math.floor(scale(0, floor, 127, 0, lastRing.y)), i + 1)
          // WebMidi.outputs[0].playNote(60, i + 1, { 
          //   rawVelocity: false, 
          //   velocity: lightning
          // });
        }
      });
      tCounter++;
    }

    counter++

    tCounter > tree.end
      && (fade = fade > 0.01 ? fade * 0.9 : 0.01);
    
    tCounter >= tree.end + 15 
      && reset();

    if(capture) {
      console.log('capturing frame');
      capturer.capture(document.getElementById('defaultCanvas0'));
    }
  }
  p.draw = draw
  
  // Tone.Transport.scheduleRepeat((time) => {
  //   draw()
  // }, "64n");

  // Tone.Transport.bpm.value = 60;
  
  // document.querySelector('button')?.addEventListener('click', async () => {
  //   await Tone.start()
  //   console.log('audio is ready')
  //   Tone.Transport.start();
  //   console.log('starting events')
  // })
}

new p5(sketch, canvas)