const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox, clipLineToCircle } = require('canvas-sketch-util/geometry');
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

const drawLine = (x1, y1, x2, y2) => {
  const p = createPath()
  p.moveTo(x1, y1)
  p.lineTo(x2 - 1, y2 + 1)  
  return p
}

const sketch = (props) => {
  const { width, height, units } = props;

  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];

  for (let i = 0; i < height; i += 0.1) {
    const line = drawLine(0, i, Math.random() * width / 2 + 2, i)
    paths.push(line)  
  }

  for (let i = 0; i < height; i += 0.1) {
    let line = drawLine(width / 2 + Math.random() * width / 2 - 2, i, width, i)
    paths.push(line)  
  }

  /*
  for (let i = 0; i < width; i += 0.1) {
    let line = drawLine(i, 0, i, height * Math.random() / 2)
    if (Math.random() < 0.8)
      paths.push(line)  
  }

  for (let i = 0; i < width; i += 0.1) {
    let line = drawLine(i, height / 3 + Math.random() * height / 2, i, height)
    if (Math.random() < 0.2)
      paths.push(line)  
  }
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
    background: 'black',
    foreground: 'white',
    // Optimize SVG paths for pen plotter use
    optimize: true
  });
};

canvasSketch(sketch, settings);
