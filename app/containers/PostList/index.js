import React, { memo } from 'react';
import { FormattedMessage } from 'react-intl';
import { Query } from 'react-apollo';
import 'parcoord-es/dist/parcoords.css';
import messages from './messages';

import PostListQuery from './Posts.graphql';

const PostList = props => (
  <Query query={PostListQuery}>
    {({ loading, error, data }) => {
      if (loading) return 'Loading...';
      if (error) return `Error! ${error.message}`;
      return (
        <div>
          <FormattedMessage {...messages.welcome} />
          <ul className="list-group">
            {data.posts.map(d => (
              <li className="list-group-item" key={d.id}>
                {d.title}
              </li>
            ))}
          </ul>
        </div>
      );
    }}
  </Query>
);

export default memo(PostList);
