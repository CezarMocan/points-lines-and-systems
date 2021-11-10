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
  // ** Random walk example **
  let maxStepLength = 0.5

  for (let xG = 0; xG < width; xG += 4 * maxStepLength) {
      for (let yG = 0; yG < height; yG += maxStepLength) {
        let x = xG
        let y = yG
        // Creating the canvas-sketch path, as usual, and moving it to our initial coordinate
        let p = createPath()
        p.moveTo(x, y)

        // We make 20 steps, each time adding a random value between 0 and maxStepLength to our x and y coordinates
        for (let i = 0; i < 5; i++) {
            let directions = [-1, 0, 0, 0, 0, 1]    
            x = x + Random.pick(directions) * maxStepLength//Random.range(-maxStepLength, maxStepLength)
            y = y + Random.pick(directions) * maxStepLength//Random.range(-maxStepLength, maxStepLength)

            // After updating our coordinates, we simply draw a line to the new point.
            p.lineTo(x, y)
        }

        paths.push(p)
      }
  }
  */

  let maxStepLength = 0.5

  // In order to simulate the grid, we do two nested for loops: one for the horizontal axis,
  // one for the vertical axis. For simplicity, we can keep the width of our grid the same as our
  // random walk's step length.
  let p = createPath()

  for (let xG = 0; xG < width; xG += 0.05 * maxStepLength) {
      for (let yG = 0; yG < height; yG += 8 * maxStepLength) {
        let x = xG
        let y = yG
        // Creating the canvas-sketch path, as usual, and moving it to our initial coordinate        
        if (Random.value() < 0.14 || yG == 0)
          p.moveTo(x, y)

        // We take 5 steps, each time adding a random value between 0 and maxStepLength to our x and y coordinates
        // This is the same random walk code as above.
        for (let i = 0; i < Random.pick([2, 4, 8]); i++) {
          let possibleSteps = [-1, 0, 0, 0, 0, 0.4]
          let stepX = Random.pick(possibleSteps)
          let stepY = Random.pick(possibleSteps)

          // We need to multiply the stepX and stepY values by maxStepLength, in order to keep our step length constraint.
          // If we didn't multiply, all steps would have a length of 1.
          x = x + stepX * maxStepLength * 0.25
          y = y + stepY * maxStepLength * 0.08

          // After updating our coordinates, we simply draw a line to the new point.
          p.lineTo(x, y)
        }  
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
    lineWidth: 0.03,
    // Optimize SVG paths for pen plotter use
    optimize: true,
    background: 'black',
    foreground: 'white'
  });
};

canvasSketch(sketch, settings);
