/**
 *
 * Asynchronously loads the component for Layout
 *
 */
import React from 'react';
import loadable from '../../../core/runtime/loadable';

export default loadable(() => import('./index'));
