import React, { useEffect } from 'react';
import createREGL from 'regl';

import { loadData } from './algs';
import render from './render';

const width = window.innerWidth;
const height = window.innerHeight;

const Vartan = props => {
  useEffect(() => {
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
