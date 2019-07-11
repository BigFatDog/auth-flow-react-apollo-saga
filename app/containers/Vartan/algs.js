import * as d3 from 'd3';
import { queue } from 'd3-queue';
import { csvParse } from 'd3-dsv';
import { csv, json } from 'd3-fetch';

function toVectorColor(colorStr) {
  const rgb = d3.rgb(colorStr);
  return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
}

function expandImageData(compressed, width, height) {
  const imgAspect = compressed.width / compressed.height;
  const scaledWidth = width;
  const scaledHeight = width / imgAspect;
  const yTranslate = (height - scaledHeight) / 2;
  const xScale = d3
    .scaleLinear()
    .domain([0, compressed.width])
    .range([0, scaledWidth]);
  const yScale = d3
    .scaleLinear()
    .domain([0, compressed.height])
    .range([yTranslate, scaledHeight + yTranslate]);
  const hue = 205;
  const saturation = 0.74;
  const points = compressed.points.map(function(d, i) {
    return {
      x: xScale(Math.round(i % compressed.width)),
      y: yScale(Math.floor(i / compressed.width)),
      color: toVectorColor(d3.hsl(hue, saturation, d).toString()),
    };
  });
  return points;
}

function sortImageData(imgData, width, height) {
  const xMid = width / 2;
  const yMid = height / 2;
  const distToMiddle = function(d) {
    return Math.pow(d.x - xMid, 2) + Math.pow(d.y - yMid, 2);
  };
  imgData.sort(function(a, b) {
    return distToMiddle(a) - distToMiddle(b);
  });
  return imgData;
}

function processImageData(compressed, width, height) {
  const expanded = expandImageData(compressed, width, height);
  return sortImageData(expanded, width, height);
}

function loadData(width, height) {
  const p1 = csv('./sampled_cities_data.csv')
    .then(citiesData => citiesData.map(d => ({ continent: d.continent, lat: +d.lat, lng: +d.lng })))
  const p2 = json('./img.json')
    .then(imgData => processImageData(imgData, width, height));
  return Promise.all([p1, p2]);
}

function colorDataByContinent(data, citiesData) {
  const colorScale = d3
    .scaleOrdinal()
    .domain(['NA', 'SA', 'EU', 'AS', 'AF', 'OC', 'AN'])
    .range(
      d3
        .range(0, 1, 1 / 6)
        .concat(1)
        .map(d3.scaleSequential(d3.interpolateCool))
    );
  const varyLightness = function(color) {
    const hsl = d3.hsl(color);
    hsl.l *= 0.1 + Math.random();
    return hsl.toString();
  };
  data.forEach(function(d, i) {
    d.color = toVectorColor(varyLightness(colorScale(citiesData[i].continent)));
  });
}

function citiesLayout(points, width, height, citiesData) {
  function projectData(data) {
    const latExtent = d3.extent(citiesData, function(d) {
      return d.lat;
    });
    const lngExtent = d3.extent(citiesData, function(d) {
      return d.lng;
    });
    const extentGeoJson = {
      type: 'LineString',
      coordinates: [[lngExtent[0], latExtent[0]], [lngExtent[1], latExtent[1]]],
    };
    const projection = d3.geoMercator().fitSize([width, height], extentGeoJson);
    data.forEach(function(d, i) {
      const city = citiesData[i];
      const location = projection([city.lng, city.lat]);
      d.x = location[0];
      d.y = location[1];
    });
  }

  projectData(points);
  colorDataByContinent(points, citiesData);
}

function photoLayout(points, width, height, imgData) {
  points.forEach(function(d, i) {
    Object.assign(d, imgData[i]);
  });
}

function barsLayout(points, width, height, citiesData) {
  const pointWidth = width / 800;
  const pointMargin = 1;
  const byContinent = d3
    .nest()
    .key(function(d) {
      return d.continent;
    })
    .entries(citiesData)
    .filter(function(d) {
      return d.values.length > 10;
    });
  const binMargin = pointWidth * 10;
  const numBins = byContinent.length;
  const minBinWidth = width / (numBins * 2.5);
  const totalExtraWidth =
    width - binMargin * (numBins - 1) - minBinWidth * numBins;
  const binWidths = byContinent.map(function(d) {
    return (
      Math.ceil((d.values.length / citiesData.length) * totalExtraWidth) +
      minBinWidth
    );
  });
  console.log(binWidths);
  const increment = pointWidth + pointMargin;
  let cumulativeBinWidth = 0;
  const binsArray = binWidths.map(function(binWidth, i) {
    const bin = {
      continent: byContinent[i].key,
      binWidth: binWidth,
      binStart: cumulativeBinWidth + i * binMargin,
      binCount: 0,
      binCols: Math.floor(binWidth / increment),
    };
    cumulativeBinWidth += binWidth - 1;
    return bin;
  });
  const bins = d3
    .nest()
    .key(function(d) {
      return d.continent;
    })
    .rollup(function(d) {
      return d[0];
    })
    .object(binsArray);
  console.log('got bins', bins);
  colorDataByContinent(points, citiesData);
  const arrangement = points.map(function(d, i) {
    const continent = citiesData[i].continent;
    const bin = bins[continent];
    if (!bin) {
      return { x: d.x, y: d.y, color: [0, 0, 0] };
    }
    const binWidth = bin.binWidth;
    const binCount = bin.binCount;
    const binStart = bin.binStart;
    const binCols = bin.binCols;
    const row = Math.floor(binCount / binCols);
    const col = binCount % binCols;
    const x = binStart + col * increment;
    const y = -row * increment + height;
    bin.binCount += 1;
    return { x: x, y: y, color: d.color };
  });
  arrangement.forEach(function(d, i) {
    Object.assign(points[i], d);
  });
  console.log('points[0]=', points[0]);
}

function swarmLayout(points, width, height, citiesData) {
  citiesLayout(points, width, height, citiesData);
  const rng = d3.randomNormal(0, 0.3);
  points.forEach(function(d, i) {
    d.y = 0.75 * rng() * height + height / 2;
  });
}

function areaLayout(points, width, height, citiesData) {
  colorDataByContinent(points, citiesData);
  const rng = d3.randomNormal(0, 0.2);
  const pointWidth = Math.round(width / 800);
  const pointMargin = 1;
  const pointHeight = pointWidth * 0.375;
  const latExtent = d3.extent(citiesData, function(d) {
    return d.lat;
  });
  const xScale = d3
    .scaleQuantize()
    .domain(latExtent)
    .range(d3.range(0, width, pointWidth + pointMargin));
  const binCounts = xScale.range().reduce(function(accum, binNum) {
    accum[binNum] = 0;
    return accum;
  }, {});
  const byContinent = d3
    .nest()
    .key(function(d) {
      return d.continent;
    })
    .entries(citiesData);
  citiesData.forEach(function(city, i) {
    city.d = points[i];
  });
  byContinent.forEach(function(continent, i) {
    continent.values.forEach(function(city, j) {
      const d = city.d;
      const binNum = xScale(city.lat);
      d.x = binNum;
      d.y = height - pointHeight * binCounts[binNum];
      binCounts[binNum] += 1;
    });
  });
}

function phyllotaxisLayout(points, pointWidth, xOffset, yOffset, citiesData) {
  if (xOffset === void 0) xOffset = 0;
  if (yOffset === void 0) yOffset = 0;
  colorDataByContinent(points, citiesData);
  const sortData = citiesData
    .map(function(city, index) {
      return { index: index, continent: city.continent };
    })
    .sort(function(a, b) {
      return a.continent.localeCompare(b.continent);
    });
  const theta = Math.PI * (3 - Math.sqrt(5));
  const pointRadius = pointWidth / 2;
  sortData.forEach(function(d, i) {
    const point = points[d.index];
    const index = i % points.length;
    const phylloX = pointRadius * Math.sqrt(index) * Math.cos(index * theta);
    const phylloY = pointRadius * Math.sqrt(index) * Math.sin(index * theta);
    point.x = xOffset + phylloX - pointRadius;
    point.y = yOffset + phylloY - pointRadius;
  });
  return points;
}

export {
  toVectorColor,
  expandImageData,
  sortImageData,
  processImageData,
  loadData,
  phyllotaxisLayout,
  areaLayout,
  swarmLayout,
  barsLayout,
  photoLayout,
  citiesLayout,
  colorDataByContinent,
};
