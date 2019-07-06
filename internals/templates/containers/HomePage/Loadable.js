/**
 * Asynchronously loads the component for HomePage
 */
import React from 'react';
import loadable from '../../core/runtime/loadable';
import Loading from '../../components/Loading';

export default loadable(() => import('./index'), {
  fallback: <Loading />,
});
