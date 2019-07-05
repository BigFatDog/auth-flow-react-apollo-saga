import React, { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { graphql } from 'react-apollo';

import { useInjectReducer } from '../../core/runtime/injectReducer';
import { useInjectSaga } from '../../core/runtime/injectSaga';
import messages from './messages';

import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
import reducer from './reducer';
import saga from './saga';

import DashboardListQuery from './Posts.graphql';
const key = 'home';

const HomePage = props => {
  useInjectReducer({ key, reducer });
  useInjectSaga({ key, saga });

  const { username, posts, onSubmitForm } = props;

  useEffect(() => {
    if (username) {
      onSubmitForm();
    }
  }, []);

  const aList = posts || [];
  const postList = aList.map(d => (
    <li className="list-group-item" key={d.id}>
      {d.title}
    </li>
  ));

  return (
    <div>
      <FormattedMessage {...messages.welcome} />
      <ul className="list-group">{postList}</ul>
    </div>
  );
};

HomePage.propTypes = {
  loading: PropTypes.bool,
  posts: PropTypes.array,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
  username: PropTypes.string,
  onChangeUsername: PropTypes.func,
};

const mapDispatchToProps = dispatch => {
  return {
    onChangeUsername: evt => dispatch(changeUsername(evt.target.value)),
    onSubmitForm: evt => {
      if (evt !== undefined && evt.preventDefault) evt.preventDefault();
      dispatch(loadRepos());
    },
  };
};

const mapStateToProps = createStructuredSelector({
  username: makeSelectUsername(),
});

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps
);

const withGraphQL = graphql(DashboardListQuery, {
  props: ({ data }) => {
    const { loading, error, posts } = data;
    if (error) throw new Error(error);
    return { loading, posts };
  },
});

export default compose(
  withGraphQL,
  withConnect,
  memo
)(HomePage);
