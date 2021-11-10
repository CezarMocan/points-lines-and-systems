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
  let p = createPath()
  p.moveTo(2, 2)
  p.quadraticCurveTo(4, 2, 4, 4)
  paths.push(p)

  let p2 = createPath()
  p2.moveTo(6, 2)
  p2.bezierCurveTo(6, 4, 8, 2, 8, 4)
  paths.push(p2)
  */

  let step = 1.5
  for (let x = 0; x <= width; x += step) {
    for (let y = 0; y <= height; y += step) {
      if (Random.value() < 0.9) continue

      let curveS = step / 1
      let p = createPath()
      p.moveTo(x, y)
      let cpX = Random.pick([x, x + curveS])
      let cpY
      if (cpX == x) {
        cpY = y + curveS
      } else {
        cpY = y
      }

      p.quadraticCurveTo(cpX, cpY, x + step, y + step)
      paths.push(p)
    }
  }

  for (let x = 0; x <= width; x += step) {
    for (let y = 0; y <= height; y += step) {
      if (Random.value() < 0.9) continue
      let curveS = step / 1      
      let p = createPath()
      p.moveTo(x, y)
      let cpX = Random.pick([x, x - curveS])
      let cpY
      if (cpX == x) {
        cpY = y + curveS
      } else {
        cpY = y
      }

      p.quadraticCurveTo(cpX, cpY, x - step, y + step)
      paths.push(p)
    }
  }

  step = 4

  for (let x = 0; x <= width; x += step) {
    for (let y = 0; y <= height; y += step) {
      if (Random.value() < 0.2) continue

      let curveS = step / 1
      let p = createPath()
      p.moveTo(x, y)
      let cpX = Random.pick([x, x + curveS])
      let cpY
      if (cpX == x) {
        cpY = y + curveS
      } else {
        cpY = y
      }

      p.quadraticCurveTo(cpX, cpY, x + step, y + step)
      paths.push(p)
    }
  }

  for (let x = 0; x <= width; x += step) {
    for (let y = 0; y <= height; y += step) {
      if (Random.value() < 0.4) continue
      let curveS = step / 1      
      let p = createPath()
      p.moveTo(x, y)
      let cpX = Random.pick([x, x - curveS])
      let cpY
      if (cpX == x) {
        cpY = y + curveS
      } else {
        cpY = y
      }

      p.quadraticCurveTo(cpX, cpY, x - step, y + step)
      paths.push(p)
    }
  }

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
