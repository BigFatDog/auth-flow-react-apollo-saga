/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import { graphql } from 'react-apollo';

import injectReducer from '../../utils/injectReducer';
import injectSaga from '../../utils/injectSaga';
import messages from './messages';

import { changeUsername } from './actions';
import { makeSelectUsername } from './selectors';
import reducer from './reducer';
import saga from './saga';

import DashboardListQuery from './Posts.graphql';

export class HomePage extends PureComponent {
  static propTypes = {
    loading: PropTypes.bool,
    posts: PropTypes.array,
    error: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
    repos: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
    onSubmitForm: PropTypes.func,
    username: PropTypes.string,
    onChangeUsername: PropTypes.func,
  };

  componentWillMount() {}

  /**
   * when initial state username is not null, submit the form to load repos
   */
  componentDidMount() {
    if (this.props.username && this.props.username.trim().length > 0) {
      this.props.onSubmitForm();
    }
  }

  render() {
    const { posts } = this.props;
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
  }
}

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

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'home', reducer });
const withSaga = injectSaga({ key: 'home', saga });

const withGraphQL = graphql(DashboardListQuery, {
  props: ({ data }) => {
    const { loading, error, posts } = data;
    if (error) throw new Error(error);
    return { loading, posts };
  },
});

export default compose(withGraphQL, withReducer, withSaga, withConnect)(
  HomePage
);
