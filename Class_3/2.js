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

  for (let radius = 0; radius < 15; radius += 0.1) {
    let angleStep = 0.02
    let centerX = width / 2
    let centerY = height / 2
    // let radius = 5
    let p = createPath()
  
    for (let angle = 0; angle <= 2 * Math.PI; angle = angle + angleStep) {
        let x = Math.cos(angle) * radius + centerX
        let y = Math.sin(angle) * radius * 1.5 + centerY
  
        let noiseX = x + Random.noise1D(angle + radius / 10, Math.PI, 0.5)
        let noiseY = y + Random.noise1D(angle + radius / 5, Math.PI / 2, 0.6)
  
        if (angle == 0 || Random.noise2D(noiseX, noiseY, 0.5, 1) < 0) {
          p.moveTo(noiseX, noiseY)
        } else {
          p.lineTo(noiseX, noiseY)
        }
    }
  
    paths.push(p)  
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
