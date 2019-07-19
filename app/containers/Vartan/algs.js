import { scaleSequential, scaleOrdinal, scaleQuantize } from 'd3-scale';
import { hsl, rgb } from 'd3-color';
import { extent, range } from 'd3-array';
import { interpolateCool } from 'd3-scale-chromatic';
import { geoMercator } from 'd3-geo';
import { randomNormal } from 'd3-random';
import { nest } from 'd3-collection';

const toVectorColor = colorStr => {
  const _rgb = rgb(colorStr);
  return [_rgb.r / 255, _rgb.g / 255, _rgb.b / 255];
};

const colorDataByContinent = (data, citiesData) => {
  const colorScale = scaleOrdinal()
    .domain(['NA', 'SA', 'EU', 'AS', 'AF', 'OC', 'AN'])
    .range(
      range(0, 1, 1 / 6)
        .concat(1)
        .map(scaleSequential(interpolateCool))
    );
  const varyLightness = color => {
    const _hsl = hsl(color);
    _hsl.l *= 0.1 + Math.random();
    return _hsl.toString();
  };
  data.forEach((d, i) => {
    d.color = toVectorColor(varyLightness(colorScale(citiesData[i].continent)));
  });
};

const citiesLayout = (points, width, height, citiesData) => {
  function projectData(data) {
    const latExtent = extent(citiesData, d => d.lat);
    const lngExtent = extent(citiesData, d => d.lng);
    const extentGeoJson = {
      type: 'LineString',
      coordinates: [[lngExtent[0], latExtent[0]], [lngExtent[1], latExtent[1]]],
    };
    const projection = geoMercator().fitSize([width, height], extentGeoJson);
    data.forEach((d, i) => {
      const city = citiesData[i];
      const location = projection([city.lng, city.lat]);
      d.x = location[0];
      d.y = location[1];
    });
  }

  projectData(points);
  colorDataByContinent(points, citiesData);
};

const photoLayout = (points, width, height, imgData) => {
  points.forEach((d, i) => {
    Object.assign(d, imgData[i]);
  });
};

const barsLayout = (points, width, height, citiesData) => {
  const pointWidth = width / 800;
  const pointMargin = 1;
  const byContinent = nest()
    .key(d => d.continent)
    .entries(citiesData)
    .filter(d => d.values.length > 10);
  const binMargin = pointWidth * 10;
  const numBins = byContinent.length;
  const minBinWidth = width / (numBins * 2.5);
  const totalExtraWidth =
    width - binMargin * (numBins - 1) - minBinWidth * numBins;
  const binWidths = byContinent.map(d => {
    return (
      Math.ceil((d.values.length / citiesData.length) * totalExtraWidth) +
      minBinWidth
    );
  });
  console.log(binWidths);
  const increment = pointWidth + pointMargin;
  let cumulativeBinWidth = 0;
  const binsArray = binWidths.map((binWidth, i) => {
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
  const bins = nest()
    .key(d => d.continent)
    .rollup(d => d[0])
    .object(binsArray);
  console.log('got bins', bins);
  colorDataByContinent(points, citiesData);
  const arrangement = points.map((d, i) => {
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
  arrangement.forEach((d, i) => {
    Object.assign(points[i], d);
  });
  console.log('points[0]=', points[0]);
};

const swarmLayout = (points, width, height, citiesData) => {
  citiesLayout(points, width, height, citiesData);
  const rng = randomNormal(0, 0.3);
  points.forEach((d, i) => {
    d.y = 0.75 * rng() * height + height / 2;
  });
};

const areaLayout = (points, width, height, citiesData) => {
  colorDataByContinent(points, citiesData);
  const rng = randomNormal(0, 0.2);
  const pointWidth = Math.round(width / 800);
  const pointMargin = 1;
  const pointHeight = pointWidth * 0.375;
  const latExtent = extent(citiesData, d => d.lat);
  const xScale = scaleQuantize()
    .domain(latExtent)
    .range(range(0, width, pointWidth + pointMargin));
  const binCounts = xScale.range().reduce((accum, binNum) => {
    accum[binNum] = 0;
    return accum;
  }, {});
  const byContinent = nest()
    .key(d => d.continent)
    .entries(citiesData);
  citiesData.forEach((city, i) => {
    city.d = points[i];
  });
  byContinent.forEach((continent, i) => {
    continent.values.forEach((city, j) => {
      const d = city.d;
      const binNum = xScale(city.lat);
      d.x = binNum;
      d.y = height - pointHeight * binCounts[binNum];
      binCounts[binNum] += 1;
    });
  });
};

const phyllotaxisLayout = (
  points,
  pointWidth,
  xOffset,
  yOffset,
  citiesData
) => {
  if (xOffset === void 0) xOffset = 0;
  if (yOffset === void 0) yOffset = 0;
  colorDataByContinent(points, citiesData);
  const sortData = citiesData
    .map((city, index) => ({ index: index, continent: city.continent }))
    .sort((a, b) => a.continent.localeCompare(b.continent));
  const theta = Math.PI * (3 - Math.sqrt(5));
  const pointRadius = pointWidth / 2;
  sortData.forEach((d, i) => {
    const point = points[d.index];
    const index = i % points.length;
    const phylloX = pointRadius * Math.sqrt(index) * Math.cos(index * theta);
    const phylloY = pointRadius * Math.sqrt(index) * Math.sin(index * theta);
    point.x = xOffset + phylloX - pointRadius;
    point.y = yOffset + phylloY - pointRadius;
  });
  return points;
};

export {
  toVectorColor,
  phyllotaxisLayout,
  areaLayout,
  swarmLayout,
  barsLayout,
  photoLayout,
  citiesLayout,
  colorDataByContinent,
};
