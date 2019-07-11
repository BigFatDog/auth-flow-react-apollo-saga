const width = window.innerWidth;
const height = window.innerHeight;
import * as d3 from 'd3';
import {
  phyllotaxisLayout,
  areaLayout,
  swarmLayout,
  barsLayout,
  photoLayout,
  citiesLayout,
} from './algs';

const render = (regl, citiesData, imgData) => {
  const numPoints = 100000;
  const pointWidth = 4;
  const pointMargin = 1;
  const duration = 1500;
  const delayByIndex = 500 / numPoints;
  const maxDuration = duration + delayByIndex * numPoints; // include max delay in here

  const toCities = function toCities(points) {
    return citiesLayout(points, width, height, citiesData);
  };
  const toBars = function toBars(points) {
    return barsLayout(points, width, height, citiesData);
  };
  const toSwarm = function toSwarm(points) {
    return swarmLayout(points, width, height, citiesData);
  };
  const toPhoto = function toPhoto(points) {
    return photoLayout(points, width, height, imgData);
  };
  const toArea = function toArea(points) {
    return areaLayout(points, width, height, citiesData);
  };
  const toPhyllotaxis = function toPhyllotaxis(points) {
    return phyllotaxisLayout(
      points,
      pointWidth,
      width / 2,
      height / 2,
      citiesData
    );
  };
  const toMiddle = function toMiddle(points) {
    points.forEach(function(d, i) {
      d.x = width / 2;
      d.y = height / 2;
      d.color = [0, 0, 0];
    });
  };
  const toBlack = function toBlack(points) {
    points.forEach(function(d, i) {
      d.color = [0, 0, 0];
    });
  };

  const layouts = [toPhyllotaxis, toCities, toArea, toBars, toPhoto, toBlack];
  let currentLayout = 0;

  // wrap d3 color scales so they produce vec3s with values 0-1
  // also limit the t value to remove darkest color
  function wrapColorScale(scale) {
    const tScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0.4, 1]);
    return function(t) {
      const rgb = d3.rgb(scale(tScale(t)));
      return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
    };
  }

  const colorScales = [
    d3.scaleSequential(d3.interpolateViridis),
    d3.scaleSequential(d3.interpolateMagma),
    d3.scaleSequential(d3.interpolateInferno),
    d3.scaleSequential(d3.interpolateCool),
  ].map(wrapColorScale);
  let currentColorScale = 0;

  // function to compile a draw points regl func
  function createDrawPoints(points) {
    const drawPoints = regl({
      frag:
        '\n\t\t  precision highp float;\n\t\t\tvarying vec3 fragColor;\n\t\t\tvoid main() {\n\t\t\t\tgl_FragColor = vec4(fragColor, 1);\n\t\t\t}\n\t\t\t',

      vert:
        '\n\t\t\tattribute vec2 positionStart;\n\t\t\tattribute vec2 positionEnd;\n\t\t\tattribute float index;\n\t\t\tattribute vec3 colorStart;\n\t\t\tattribute vec3 colorEnd;\n\n\t\t\tvarying vec3 fragColor;\n\n\t\t\tuniform float pointWidth;\n\t\t\tuniform float stageWidth;\n\t\t\tuniform float stageHeight;\n\t\t\tuniform float elapsed;\n\t\t\tuniform float duration;\n\t\t\tuniform float delayByIndex;\n\t\t\t// uniform float tick;\n\t\t\t// uniform float animationRadius;\n\t\t\tuniform float numPoints;\n\n\t\t\t// helper function to transform from pixel space to normalized device coordinates (NDC)\n\t\t\t// in NDC (0,0) is the middle, (-1, 1) is the top left and (1, -1) is the bottom right.\n\t\t\tvec2 normalizeCoords(vec2 position) {\n\t\t\t\t// read in the positions into x and y vars\n\t      float x = position[0];\n\t      float y = position[1];\n\n\t\t\t\treturn vec2(\n\t\t      2.0 * ((x / stageWidth) - 0.5),\n\t\t      // invert y since we think [0,0] is bottom left in pixel space\n\t\t      -(2.0 * ((y / stageHeight) - 0.5)));\n\t\t\t}\n\n\t\t\t// helper function to handle cubic easing (copied from d3 for consistency)\n\t\t\t// note there are pre-made easing functions available via glslify.\n\t\t\tfloat easeCubicInOut(float t) {\n\t\t\t\tt *= 2.0;\n        t = (t <= 1.0 ? t * t * t : (t -= 2.0) * t * t + 2.0) / 2.0;\n\n        if (t > 1.0) {\n          t = 1.0;\n        }\n\n        return t;\n\t\t\t}\n\n\t\t\tvoid main() {\n\t\t\t\tgl_PointSize = pointWidth;\n\n\t\t\t\tfloat delay = delayByIndex * index;\n\t      float t;\n\n\t      // drawing without animation, so show end state immediately\n\t      if (duration == 0.0) {\n\t        t = 1.0;\n\n\t      // still delaying before animating\n\t      } else if (elapsed < delay) {\n\t        t = 0.0;\n\t      } else {\n\t        t = easeCubicInOut((elapsed - delay) / duration);\n\t      }\n\n\t      // interpolate position\n\t      vec2 position = mix(positionStart, positionEnd, t);\n\n\t      // apply an ambient animation\n\t\t\t\t// float dir = index > numPoints / 2.0 ? 1.0 : -1.0;\n\t      // position[0] += animationRadius * cos((tick + index) * dir);\n\t      // position[1] += animationRadius * sin((tick + index) * dir);\n\n\t      // above we + index to offset how they move\n\t      // we multiply by dir to change CW vs CCW for half\n\n\n\t      // interpolate color\n\t      fragColor = mix(colorStart, colorEnd, t);\n\n\t      // scale to normalized device coordinates\n\t\t\t\t// gl_Position is a special variable that holds the position of a vertex\n\t      gl_Position = vec4(normalizeCoords(position), 0.0, 1.0);\n\t\t\t}\n\t\t\t',

      attributes: {
        positionStart: points.map(function(d) {
          return [d.sx, d.sy];
        }),
        positionEnd: points.map(function(d) {
          return [d.tx, d.ty];
        }),
        colorStart: points.map(function(d) {
          return d.colorStart;
        }),
        colorEnd: points.map(function(d) {
          return d.colorEnd;
        }),
        index: d3.range(points.length),
      },

      uniforms: {
        pointWidth: regl.prop('pointWidth'),
        stageWidth: regl.prop('stageWidth'),
        stageHeight: regl.prop('stageHeight'),
        delayByIndex: regl.prop('delayByIndex'),
        duration: regl.prop('duration'),
        numPoints: numPoints,
        // animationRadius: 0,// 15.0,
        // tick: (reglprops) => { // increase multiplier for faster animation speed
        // 	// console.log(reglprops);
        // 	// return reglprops.tick / 50;
        // 	return 0; // disable ambient animation
        // },
        // time in milliseconds since the prop startTime (i.e. time elapsed)
        elapsed: function elapsed(_ref, _ref2) {
          const time = _ref.time;
          const _ref2$startTime = _ref2.startTime,
            startTime = _ref2$startTime === undefined ? 0 : _ref2$startTime;
          return (time - startTime) * 1000;
        },
      },

      count: points.length,
      primitive: 'points',
    });

    return drawPoints;
  }

  // function to start animation loop (note: time is in seconds)
  function animate(layout, points) {
    console.log('animating with new layout');
    // make previous end the new beginning
    points.forEach(function(d) {
      d.sx = d.tx;
      d.sy = d.ty;
      d.colorStart = d.colorEnd;
    });

    // layout points
    layout(points);

    // copy layout x y to end positions
    const colorScale = colorScales[currentColorScale];
    points.forEach(function(d, i) {
      d.tx = d.x;
      d.ty = d.y;
      // d.colorEnd = colorScale(i / points.length)
      d.colorEnd = d.color;
    });

    // create the regl function with the new start and end points
    const drawPoints = createDrawPoints(points);

    // start an animation loop
    let startTime = null; // in seconds
    const frameLoop = regl.frame(function(_ref3) {
      const time = _ref3.time;

      // keep track of start time so we can get time elapsed
      // this is important since time doesn't reset when starting new animations
      if (startTime === null) {
        startTime = time;
      }

      // clear the buffer
      regl.clear({
        // background color (black)
        color: [0, 0, 0, 1],
        depth: 1,
      });

      // draw the points using our created regl func
      // note that the arguments are available via `regl.prop`.
      drawPoints({
        pointWidth: pointWidth,
        stageWidth: width,
        stageHeight: height,
        duration: duration,
        delayByIndex: delayByIndex,
        startTime: startTime,
      });

      // how long to stay at a final frame before animating again (in seconds)
      const delayAtEnd = 0.1;

      // if we have exceeded the maximum duration, move on to the next animation
      if (time - startTime > maxDuration / 1000 + delayAtEnd) {
        console.log('done animating, moving to next layout');

        frameLoop.cancel();
        currentLayout = (currentLayout + 1) % layouts.length;
        currentColorScale = (currentColorScale + 1) % colorScales.length;

        // when restarting at the beginning, come back from the middle again
        if (currentLayout === 0) {
          points.forEach(function(d, i) {
            d.tx = width / 2;
            d.ty = height / 2;
            d.colorEnd = [0, 0, 0];
          });
        }

        animate(layouts[currentLayout], points);
      }
    });
  }

  // create initial set of points
  const points = d3.range(numPoints).map(function(d) {
    return {};
  });

  points.forEach(function(d, i) {
    d.tx = width / 2;
    d.ty = height / 2;
    d.colorEnd = [0, 0, 0];
  });

  // start animation loop
  animate(layouts[currentLayout], points);
};

export default render;
