import React, { useEffect } from 'react';
import createREGL from 'regl';
import { scaleLinear } from 'd3-scale';
import { hsl, color } from 'd3-color';
import { csv, json } from 'd3-fetch';

import { toVectorColor } from './algs';
import render from './render';

const expandImageData = (compressed, width, height) => {
  const imgAspect = compressed.width / compressed.height;
  const scaledWidth = width;
  const scaledHeight = width / imgAspect;
  const yTranslate = (height - scaledHeight) / 2;
  const xScale = scaleLinear()
    .domain([0, compressed.width])
    .range([0, scaledWidth]);
  const yScale = scaleLinear()
    .domain([0, compressed.height])
    .range([yTranslate, scaledHeight + yTranslate]);

  const xStep = compressed.width / 1000;
  const yStep = compressed.height / 1000;
  const hue = 205;
  const saturation = 0.74;

  const pixelData = [];
  let idx = 0;
  for (let i = 0; i < compressed.width; i += xStep) {
    for (let j = 0; j < compressed.height; j += yStep) {
      pixelData.push({
        x: xScale(i),
        y: yScale(j),
        color: toVectorColor(
          hsl(hue, saturation, compressed.points[idx]).toString()
        ),
      });
      idx++;
    }
  }
  console.log(idx);

  return pixelData;
};

const sortImageData = (imgData, width, height) => {
  const xMid = width / 2;
  const yMid = height / 2;
  const distToMiddle = d => Math.pow(d.x - xMid, 2) + Math.pow(d.y - yMid, 2);
  imgData.sort((a, b) => distToMiddle(a) - distToMiddle(b));
  return imgData;
};

const processImageData = (compressed, width, height) => {
  const expanded = expandImageData(compressed, width, height);
  return sortImageData(expanded, width, height);
};

const loadData = (width, height) => {
  const p1 = csv('./sampled_cities_data.csv').then(citiesData =>
    citiesData.map(d => ({ continent: d.continent, lat: +d.lat, lng: +d.lng }))
  );
  const p2 = json('./test.json').then(imgData =>
    processImageData(imgData, width, height)
  );
  return Promise.all([p1, p2]);
};

const Vartan = props => {
  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    loadData(width, height).then(loaded => {
      const citiesData = loaded[0];
      const imgData = loaded[1];
      console.log('data has loaded. initializing regl...');

      // initialize regl
      createREGL({
        // callback when regl is initialized
        onDone: (err, regl) => {
          if (err) {
            console.error('Error initializing regl', err);
            return;
          }
          render({ regl, citiesData, imgData, width, height });
        },
      });
    });
  }, []);

  return <div />;
};

export default Vartan;