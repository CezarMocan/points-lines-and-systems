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

const drawSquareRandom = (x, y, w, h) => {
  const p = createPath()
  p.moveTo(x + Math.random(), y + Math.random())
  p.lineTo(x + 0.2 + Math.random(), y + h + Math.random())
  p.lineTo(x + w + Math.random(), y + h + Math.random())
  p.lineTo(x + w + Math.random(), y + Math.random())  
  p.closePath()  

  return p
}

const drawSquare = (x, y, w, h) => {
  const p = createPath()
  p.moveTo(x, y)
  p.lineTo(x, y + h)
  p.lineTo(x + w, y + h)
  p.lineTo(x + w, y)  
  p.closePath()  

  return p
}

const sketch = (props) => {
  const { width, height, units } = props;

  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];

  let squarePadding = 0.1
  let gap = 0.02
  let increment = 0.002

  while (squarePadding < width / 2 && squarePadding < height / 2) {
    let topLeftX = squarePadding
    let topLeftY = squarePadding
    let squareWidth = width - 2 * squarePadding
    let squareHeight = height - 2 * squarePadding
  
    paths.push(drawSquare(topLeftX, topLeftY, squareWidth, squareHeight))
    
    squarePadding = squarePadding + gap
    gap = gap + increment
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
    lineWidth: 0.06,
    background: 'black',
    foreground: 'white',
    // Optimize SVG paths for pen plotter use
    optimize: true
  });
};

canvasSketch(sketch, settings);
