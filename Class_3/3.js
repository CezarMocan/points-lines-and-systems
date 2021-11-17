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

const sketch = (props) => {
  const { width, height, units } = props;

  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];

  /*
  let stepX = 0.2
  let stepY = 0.2
  let p = createPath()

  for (let x = 0; x <= width; x = x + stepX) {
    for (let y = 0; y <= height; y = y + stepY) {
      p.moveTo(x, y)
      p.lineTo(x + 0.1, y + 0.1)
    }
  }

  paths.push(p)
  */

  /*
  let stepX = 0.3
  let stepY = 0.3
  let p = createPath()

  for (let x = 0; x <= width; x = x + stepX) {
    for (let y = 0; y <= height; y = y + stepY) {
      // amplitude 0.1, 0.2, 2
      // frequency 1, 5, 50
      let noiseXY = Random.noise2D(x, y, 0.1, 1)
      p.moveTo(x, y)
      p.lineTo(x + noiseXY, y + noiseXY)
    }
  }
  paths.push(p)
  */

  let stepX = 0.3
  let stepY = 0.3
  let p = createPath()

  for (let x = 0; x <= width; x = x + stepX) {
    for (let y = 0; y <= height; y = y + stepY) {
      let noiseX = Random.noise2D(x, y, 0.1, 0.5)
      // frequency 0.05, 0.07, 2, 0.1
      let noiseY = Random.noise2D(x, y, 2, 0.5)

      if (noiseY < -1/3) noiseY = -0.5
      else if (noiseY < 1/3) noiseY = 0
      else noiseY = 0.5

      if (noiseX < -1/3) noiseX = -0.5
      else if (noiseX < 1/3) noiseX = 0
      else noiseX = 0.5

      p.moveTo(x, y)
      p.lineTo(x + noiseX, y + noiseY)
    }
  }
  paths.push(p)

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
    lineWidth: 0.08,
    // Optimize SVG paths for pen plotter use
    optimize: true,
    background: 'black',
    foreground: 'white'
  });
};

canvasSketch(sketch, settings);
