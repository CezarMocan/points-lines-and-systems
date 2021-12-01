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

const rectangleSubdivision = (x, y, width, height, depth, maxDepth, p, stop = false) => {
  // Ending condition: if our current recursion "depth" is larger than the maximum depth we want to get to, 
  // we stop the execution.
  x = x + Random.noise3D(x, y, depth, 0.05, 0.5)
  y = y + Random.noise3D(x, y, depth, 0.02, 0.2)
  if (depth > maxDepth || stop) {
    if (stop) {
        // p.moveTo(x, y)
        // p.arc(x, y, 1 / depth, Random.noise2D(x, y, 0.1, Math.PI), Random.noise2D(x, y, 0.2, Math.PI))
        for (let i = -0.2; i < 0.2; i += 0.1) {
            p.moveTo(x + width - 0.25 + i, y + i + 0.25)
            // p.lineTo(x + i + 0.25, y + height - 0.25 + i)
        }
    } else {
        // p.moveTo(x, y)
        // p.lineTo(x + width, y + height)
        p.moveTo(x, y)
        p.arc(x, y, 0.1, Random.noise2D(x, y, 0.1, Math.PI), Random.noise2D(x, y, 0.2, Math.PI))
    }
  } else {
    // Split the current rectangle into four pieces, and call the function recursively on each.
    rectangleSubdivision(x, y, width / 2, height / 2, depth + 1, maxDepth, p, !(Random.range(0, 1) < 0.9 || depth < 2))
    rectangleSubdivision(x + width / 2, y, width / 2, height / 2, depth + 1, maxDepth, p, !(Random.range(0, 1) < 0.7 || depth < 3))
    rectangleSubdivision(x, y + height / 2, width / 2, height / 2, depth + 1, maxDepth, p, !(Random.range(0, 1) < 0.8 || depth < 3))
    rectangleSubdivision(x + width / 2, y + height / 2, width / 2, height / 2, depth + 1, maxDepth, p, !(Random.range(0, 1) < 0.9 || depth < 4))
  }
}

const sketch = (props) => {
  const { width, height, units } = props;

  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];
  const p = createPath()

  rectangleSubdivision(-2, -2, width + 2, height + 2, 0, 6, p)

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
    lineWidth: 0.04,
    // Optimize SVG paths for pen plotter use
    optimize: false,
    background: 'black',
    foreground: 'white'
  });
};

canvasSketch(sketch, settings);
