/*
 *
 * LanguageToggle
 *
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';

import { changeLocale } from '../LanguageProvider/actions';
import { makeSelectLocale } from '../LanguageProvider/selectors';

import CN_FLAG from './flag_zh.png';
import EN_FLAG from './flag_en.png';
import ToggleContainer from './ToggleContainer';

export class LocaleToggle extends PureComponent {
  // eslint-disable-line react/prefer-stateless-function
  render() {
    const { locale } = this.props;
    const flag = locale === 'zh' ? CN_FLAG : EN_FLAG;

    return (
      <ToggleContainer>
        <li onClick={evt => this.props.onLocaleToggle(evt, 'zh')}>
          <a href="javascript:void(0)" className="capitalize action-lang-zh">
            <img src={CN_FLAG} />
          </a>
        </li>
        <li onClick={evt => this.props.onLocaleToggle(evt, 'en')}>
          <a href="javascript:void(0)" className="capitalize action-lang-en">
            <img src={EN_FLAG} />
          </a>
        </li>
      </ToggleContainer>
    );
  }
}

LocaleToggle.propTypes = {
  onLocaleToggle: PropTypes.func,
  locale: PropTypes.string,
};

const mapStateToProps = createSelector(
  makeSelectLocale(),
  locale => ({
    locale,
  })
);

export function mapDispatchToProps(dispatch) {
  return {
    onLocaleToggle: (evt, locale) => dispatch(changeLocale(locale)),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LocaleToggle);
