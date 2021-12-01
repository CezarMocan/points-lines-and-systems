const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math')

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

const triangleSubdivision = (Ax, Ay, Bx, By, Cx, Cy, depth, maxDepth, p, stop = false) => {
  if (depth > maxDepth) {
    // Draw the rectangle specified by the current coordinates and width/height pair
    p.moveTo(Ax, Ay)
    p.lineTo(Bx, By)
    p.lineTo(Cx, Cy)
    p.lineTo(Ax, Ay)
  } else {
    // Split the current rectangle into four pieces, and call the function recursively on each.
    let splitPoint = Random.range(0.4, 0.7)
    let midX = math.lerp(Bx, Cx, splitPoint)
    let midY = math.lerp(By, Cy, splitPoint)

    triangleSubdivision(midX, midY, Ax, Ay, Bx, By, depth + 1, maxDepth, p, !(Random.range(0, 1) < 0.8))
    triangleSubdivision(midX, midY, Ax, Ay, Cx, Cy, depth + 1, maxDepth, p, !(Random.range(0, 1) < 0.8))
  }
}

const sketch = (props) => {
  const { width, height, units } = props;

  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];
  const p = createPath()

  triangleSubdivision(0, 0, 0, height, width, 0,  0, 7, p)
  triangleSubdivision(width, height, 0, height, width, 0,  0, 7, p)

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
    lineWidth: 0.015,
    // Optimize SVG paths for pen plotter use
    optimize: false,
    background: 'black',
    foreground: 'white'
  });
};

canvasSketch(sketch, settings);
