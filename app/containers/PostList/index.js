import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { compose } from 'redux';
import { graphql } from 'react-apollo';

import messages from './messages';

import DashboardListQuery from './Posts.graphql';

const PostList = props => {
  const { posts } = props;

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

PostList.propTypes = {
  loading: PropTypes.bool,
  posts: PropTypes.array,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  onSubmitForm: PropTypes.func,
};

const withGraphQL = graphql(DashboardListQuery, {
  props: ({ data }) => {
    const { loading, error, posts } = data;
    if (error) throw new Error(error);
    return { loading, posts };
  },
});

export default compose(
  withGraphQL,
  memo
)(PostList);
