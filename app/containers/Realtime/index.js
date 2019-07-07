import React, { useEffect } from 'react';
import { fromEvent, defer } from 'rxjs';
import {
  delay,
  delayWhen,
  takeUntil,
  map,
  filter,
  sampleTime,
  scan,
} from 'rxjs/operators';
import { webSocket } from 'rxjs/webSocket';
import * as d3 from 'd3';

const LineChart = props => {
  useEffect(() => {
    const updatesOverTime = [];

    const width = 960;
    const height = 600;
    const margins = {
      top: 20,
      bottom: 50,
      left: 70,
      right: 20,
    };

    const svg = d3
      .select('svg')
      .attr('width', width)
      .attr('height', height + 200);

    const xRange = d3
      .scaleTime()
      .range([margins.left, width - margins.right])
      .domain([new Date(), new Date()]);
    const yRange = d3
      .scaleLinear()
      .range([height - margins.bottom, margins.top])
      .domain([0, 0]);
    const xAxis = d3
      .axisBottom()
      .scale(xRange)
      .tickSize(5)
      // .tickSubdivide(true)
      .tickFormat(d3.timeFormat('%X'));
    const yAxis = d3
      .axisLeft()
      .scale(yRange)
      .tickSize(5);
    // .tickSubdivide(true);

    const xAxisElement = svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + (height - margins.bottom) + ')')
      .call(xAxis);

    // Add a label to the middle of the x axis
    const xAxisWidth = (width - margins.right - margins.left) / 2;
    xAxisElement
      .append('text')
      .attr('x', margins.left + xAxisWidth)
      .attr('y', 0)
      .attr('dy', '3em')
      .style('text-anchor', 'middle')
      .text('Time');

    const yAxisElement = svg
      .append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(' + margins.left + ',0)')
      .call(yAxis);

    // Add a label to the middle of the y axis
    const yAxisHeight = (height - margins.bottom - margins.top) / 2;
    yAxisElement
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0)
      .attr('x', -(margins.top + yAxisHeight))
      .attr('dy', '-3.5em')
      .style('text-anchor', 'middle')
      .text('Updates per second');

    // Define our line series
    const lineFunc = d3
      .line()
      .x(d => xRange(d.x))
      .y(d => yRange(d.y))
      .curve(d3.curveLinear);

    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('x', margins.left)
      .attr('y', margins.top)
      .attr('width', width)
      .attr('height', height);

    const line = svg
      .append('g')
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .attr('stroke', 'blue')
      .attr('fill', 'none');

    // Add a text element below the chart, which will display the subject of new edits
    svg
      .append('text')
      .attr('class', 'edit-text')
      .attr(
        'transform',
        'translate(' + margins.left + ',' + (height + 20) + ')'
      )
      .attr('width', width - margins.left);

    // Add a text element below the chart, which will display the times that new users
    // are added
    const newUserTextWidth = 150;
    svg
      .append('text')
      .attr('class', 'new-user-text')
      .attr('fill', 'green')
      .attr(
        'transform',
        'translate(' +
          (width - margins.right - newUserTextWidth) +
          ',' +
          (height + 20) +
          ')'
      )
      .attr('width', newUserTextWidth);

    const samplingTime = 2000;
    const maxNumberOfDataPoints = 20;

    function update(updates) {
      // Update the ranges of the chart to reflect the new data
      if (updates.length > 0) {
        xRange.domain(d3.extent(updates, d => d.x));
        yRange.domain([d3.min(updates, d => d.y), d3.max(updates, d => d.y)]);
      }

      // Until we have filled up our data window, we just keep adding data
      // points to the end of the chart.
      if (updates.length < maxNumberOfDataPoints) {
        line
          .transition()
          .ease(d3.easeLinear)
          .attr('d', lineFunc(updates));

        svg
          .selectAll('g.x.axis')
          .transition()
          .ease(d3.easeLinear)
          .call(xAxis);
      }
      // Once we have filled up the window, we then remove points from the
      // start of the chart, and move the data over so the chart looks
      // like it is scrolling forwards in time
      else {
        // Calculate the amount of translation on the x axis which equates to the
        // time between two samples
        const xTranslation = xRange(updates[0].x) - xRange(updates[1].x);

        // Transform our line series immediately, then translate it from
        // right to left. This gives the effect of our chart scrolling
        // forwards in time
        line
          .attr('d', lineFunc(updates))
          .attr('transform', null)
          .transition()
          .duration(samplingTime - 20)
          .ease(d3.easeLinear)
          .attr('transform', 'translate(' + xTranslation + ', 0)');

        svg
          .selectAll('g.x.axis')
          .transition()
          .duration(samplingTime - 20)
          .ease(d3.easeLinear)
          .call(xAxis);
      }

      svg
        .selectAll('g.y.axis')
        .transition()
        .call(yAxis);
    }

    const textUpdateTransitionDuration = 550;
    const updateNewUser = newUser => {
      const text = svg.selectAll('text.new-user-text').data(newUser);

      text
        .transition()
        .duration(textUpdateTransitionDuration)
        .style('fill-opacity', 1e-6)
        .transition()
        .duration(textUpdateTransitionDuration)
        .style('fill-opacity', 1)
        .text(d => d);
    };

    const updateEditText = function(latestEdit) {
      const text = svg.selectAll('text.edit-text').data(latestEdit);

      text
        .transition()
        .duration(textUpdateTransitionDuration)
        .style('fill-opacity', 1e-6)
        .transition()
        .duration(textUpdateTransitionDuration)
        .style('fill-opacity', 1)
        .text(d => d);
    };

    const socket$ = webSocket('ws://wiki-update-sockets.herokuapp.com/');
    //receive messages
    // socket$.subscribe(
    //   msg => console.log('message received: ' + msg),
    //   err => console.log(err),
    //   () => console.log('complete'),
    // );

    const updateStream = socket$.pipe(map(event => event));
    // Filter the update stream for newuser events
    const newUserStream = updateStream.pipe(filter(d => d.type === 'newuser'));

    newUserStream.subscribe(() => {
      const format = d3.timeFormat('%X');
      updateNewUser(['New user at: ' + format(new Date())]);
    });

    // Filter the update stream for unspecified events, which we're taking to mean
    // edits in this case
    const editStream = updateStream.pipe(filter(d => d.type === 'unspecified'));
    editStream.subscribe(results => {
      updateEditText(['Last edit: ' + results.content]);
    });

    // Calculate the rate of updates over time
    const updateCount = updateStream.pipe(scan((acc, one) => ++acc, 0));

    const sampledUpdates = updateCount.pipe(sampleTime(samplingTime));
    let totalUpdatesBeforeLastSample = 0;
    sampledUpdates.subscribe(value => {
      updatesOverTime.push({
        x: new Date(),
        y: (value - totalUpdatesBeforeLastSample) / (samplingTime / 1000),
      });
      if (updatesOverTime.length > maxNumberOfDataPoints) {
        updatesOverTime.shift();
      }
      totalUpdatesBeforeLastSample = value;
      update(updatesOverTime);
    });
  }, []);

  return <svg />;
};

export default LineChart;
