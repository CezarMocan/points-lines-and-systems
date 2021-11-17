const canvasSketch = require('canvas-sketch');
const { renderPaths, createPath, pathsToPolylines } = require('canvas-sketch-util/penplot');
const { clipPolylinesToBox } = require('canvas-sketch-util/geometry');
const Random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');

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

const walkTheField = (mat, stepX, stepY, x, y, noSteps, stepLength, p, width, height) => {
    let newX = x, newY = y
    p.moveTo(newX, newY)

    for (let step = 0; step < noSteps; step++) {
      if (newX < 0 || newX > width || newY < 0 || newY > height) continue

      let i = Math.floor(newX / stepX)
      let j = Math.floor(newY / stepY)        

      let angle = mat[i][j]
      let radius = stepLength

      newX = newX + Math.cos(angle) * radius
      newY = newY + Math.sin(angle) * radius

      p.lineTo(newX, newY)
    }
}

const sketch = (props) => {
  const { width, height, units } = props;

  // Holds all our 'path' objects
  // which could be from createPath, or SVGPath string, or polylines
  const paths = [];

  let stepX = 0.25
  let stepY = 0.25
  let p = createPath()
  
  
  let mat = new Array(300)
  for (let x = 0; x <= width; x = x + stepX) {
    let i = Math.floor(x / stepX)
    mat[i] = []
    for (let y = 0; y <= height; y = y + stepY) {
        let noise = Random.noise2D(x, y, 0.01, 1)
        let angle = math.mapRange(noise, -1, 1, 0, 2 * Math.PI)
        angle = angle - (angle % (Math.PI / 4))
        
        let j = Math.floor(y / stepY)            

        mat[i].push(angle)        
    }
  }

  //walkTheField(mat, stepX, stepY, width / 2, height / 2, 300, 0.1, p, width, height)
  for (let i = 0; i < 4000; i++) {
      let x = Random.range(0, width)
      let y = Random.range(0, height)
      walkTheField(mat, stepX, stepY, x, y, Random.gaussian(20, 80), 0.2, p, width, height)
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
    lineWidth: 0.02,
    // Optimize SVG paths for pen plotter use
    optimize: true,
    background: 'black',
    foreground: 'white'
  });
};

canvasSketch(sketch, settings);
