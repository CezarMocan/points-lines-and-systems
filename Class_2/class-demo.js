const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');

// You can force a specific seed by replacing this with a string value
const defaultSeed = '995856';

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

  let x, y
  x = width / 2
  y = height / 2

  let maxStepLength = 0.1

  let p = createPath()
  p.moveTo(x, y)

  for (let xG = 0; xG <= width; xG += 2) {
    for (let yG = 0; yG <= height; yG += 0.5) {
      x = xG
      y = yG

      p.moveTo(x, y)

      for (let step = 0; step < 10; step++) {
        x = x + Random.range(-maxStepLength, maxStepLength)
        y = y + Random.range(-maxStepLength, maxStepLength)
        
        /*
        if (x < 0 || x > width || y < 0 || y > height) {
          x = width / 2
          y = height / 2
          p.moveTo(x, y)
        }
        */
    
        p.lineTo(x, y)
      }
    
    }
  }

  paths.push(p)

  // Convert the paths into polylines so we can apply line-clipping
  // When converting, pass the 'units' to get a nice default curve resolution
  let lines = pathsToPolylines(paths, { units });

  // Clip to bounds, using a margin in working units
  const margin = 0; // in working 'units' based on settings
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
    optimize: true
  });
};

canvasSketch(sketch, settings);
