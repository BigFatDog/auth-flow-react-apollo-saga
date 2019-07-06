import React from 'react';
import { IntlProvider } from 'react-intl';
import { render } from '@testing-library/react';
import '@test'
import { browserHistory } from 'react-router-dom';

import configureStore from '../../../configureStore';
import HomePage from '../index';

describe('<HomePage />', () => {
  let store;

  beforeAll(() => {
    store = configureStore({}, browserHistory);
  });

  it('should render and match the snapshot', () => {
    const {
      container: { firstChild },
    } = render(
      <Provider store={store}>
        <IntlProvider locale="en">
          <HomePage loading={false} error={false} repos={[]} />
        </IntlProvider>
      </Provider>,
    );
    expect(firstChild).toMatchSnapshot();
  });
});
