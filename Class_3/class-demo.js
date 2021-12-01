const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');

// You can force a specific seed by replacing this with a string value
const defaultSeed = '';

// Set a random seed so we can reproduce this print later
Random.setSeed(defaultSeed || Random.getRandomSeed());

// Print to console so we can see which seed is being used and copy it if desired
console.log('Random Seed:', Random.getSeed());

const settings = {
  suffix: Random.getSeed(),
  dimensions: 'A4',
  orientation: 'portrait',
  pixelsPerInch: 300,
  scaleToView: true,
  units: 'cm'
};

const drawNoisyCircle = (centerX, centerY, radius) => {
  let p = createPath()

  let angleStep = 0.05
  for (let angle = 0; angle <= 2 * Math.PI; angle = angle + angleStep) {
    let x = Math.cos(angle) * radius + centerX
    let y = Math.sin(angle) * radius + centerY

    let noiseX = x + Random.noise1D(angle + radius * 0.25, 1, 1)
    let noiseY = y + Random.noise1D(angle + radius * 0.25, 1, 1)

    if (angle == 0) {
      p.moveTo(noiseX, noiseY)
    } else {
      p.lineTo(noiseX, noiseY)
    }
  }

  p.closePath()

  return p
}

const sketch = (props) => {
  const { width, height, units } = props;

  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];
  let p = createPath()

  for (let x = 0; x <= width; x = x + 0.3) {
    for (let y = 0; y <= height; y = y + 0.3) {
      let heightPercent = y / height

      p.moveTo(x, y)
      let noiseXY = Random.noise2D(x, y, heightPercent * 0.25, Math.sin(heightPercent * 3))
      p.lineTo(x + noiseXY, y + noiseXY)
    }
  }

  paths.push(p)


  /*
  for (let radius = 1; radius <= 7; radius = radius + 0.1) {
    let p = drawNoisyCircle(width / 2, height / 2, radius)
    paths.push(p)
  }
  */


  /*
  let p = createPath()
  let lineY = 6
  p.moveTo(0, lineY)

  for (let x = 0; x <= width; x = x + 0.1) {
    let randomY = lineY + Random.range(-1, 1)
    p.lineTo(x, randomY)
  }

  paths.push(p)

  let p2 = createPath()
  let lineY2 = 10
  p2.moveTo(0, lineY2)

  for (let x = 0; x <= width; x = x + 0.1) {
    let noiseY = lineY2 + Random.noise1D(x, 1, 1)
    p2.lineTo(x, noiseY)
  }

  paths.push(p2)
  */



  // Convert the paths into polylines so we can apply line-clipping
  // When converting, pass the 'units' to get a nice default curve resolution
  let lines = pathsToPolylines(paths, { units });

  // Clip to bounds, using a margin in working units
  const margin = 1; // in working 'units' based on settings
  const box = [ margin, margin, width - margin, height - margin ];
  lines = clipPolylinesToBox(lines, box);

  // The 'penplot' util includes a utility to render
  // and export both PNG and SVG files
  return props => renderPaths(lines, {
    ...props,
    lineJoin: 'round',
    lineCap: 'round',
    // in working units; you might have a thicker pen
    lineWidth: 0.05,
    // Optimize SVG paths for pen plotter use
    optimize: true,
    background: 'black',
    foreground: 'white'
  });
};

canvasSketch(sketch, settings);
