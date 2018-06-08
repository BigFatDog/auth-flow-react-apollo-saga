import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { func, instanceOf } from 'prop-types';
import { push } from 'react-router-redux';

import messages from './messages';

import { NavBar, NavHeader, NavLink } from './Styles';

import { logout } from '../../../core/auth/actions';
import saga from './saga';
import injectSaga from '../../../utils/injectSaga';

class Header extends Component {
  static propTypes = {
    onLogout: func.isRequired,
  };

  constructor(props) {
    super(props);

    this.logout = e => this._logout(e);
  }

  _logout() {
    const { onLogout } = this.props;
    onLogout();
  }

  render() {
    return (
      <NavBar>
        <NavHeader>
          <Link to="/" className="nav-link">
            Home
          </Link>

          <Link to="/post" className="nav-link">
            Post
          </Link>
        </NavHeader>
        <NavHeader>
          <a className="nav-link" />

          <a className="nav-link" onClick={this.logout}>
            <FormattedMessage {...messages.logout} />
          </a>
        </NavHeader>
      </NavBar>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    onLogout: evt => {
      dispatch(logout());
      dispatch(push('/login'));
    },
  };
};

const withConnect = connect(null, mapDispatchToProps);
const withSaga = injectSaga({ key: 'logout', saga });

export default compose(withConnect, withSaga)(Header);
