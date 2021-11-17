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

  let stepX = 0.1
  // Draw line 1, altered by randomness
  let lineY = height / 5
  let p = createPath()
  p.moveTo(0, lineY)

  for (let x = 0; x <= width; x += stepX) {
    let randomY = lineY + Random.range(-1, 1)
    p.lineTo(x, randomY)
  }

  paths.push(p)

  // Draw line 2, altered by noise
  lineY = 2 * height / 5
  p = createPath()
  p.moveTo(0, lineY)

  for (let x = 0; x <= width; x += stepX) {
    // Get random noise for X, with a frequency of 1 and an amplitude of 1
    let noiseY = lineY + Random.noise1D(x, 1, 1)
    p.lineTo(x, noiseY)
  }
  paths.push(p)

  // Draw line 3, altered by noise with different frequency
  lineY = 3 * height / 5
  p = createPath()
  p.moveTo(0, lineY)

  for (let x = 0; x <= width; x += stepX) {
    // Get random noise for X, with a frequency of 1 and an amplitude of 1
    let noiseY = lineY + Random.noise1D(x, 5, 1)
    p.lineTo(x, noiseY)
  }
  paths.push(p)


  // Draw line 4, altered by noise with different amplitude
  lineY = 4 * height / 5
  p = createPath()
  p.moveTo(0, lineY)

  for (let x = 0; x <= width; x += stepX) {
    // Get random noise for X, with a frequency of 1 and an amplitude of 1
    let noiseY = lineY + Random.noise1D(x, 0.2, 1)
    p.lineTo(x, noiseY)
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
