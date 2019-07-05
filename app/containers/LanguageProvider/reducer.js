/*
 *
 * LanguageProvider reducer
 *
 */
import { CHANGE_LOCALE } from './constants';
import { DEFAULT_LOCALE } from '../../i18n';
import produce from 'immer';

const initialState = {
  locale: DEFAULT_LOCALE,
};

const languageProviderReducer = (state = initialState, action) =>
  produce(state, draft => {
    switch (action.type) {
      case CHANGE_LOCALE:
        draft.locale = action.locale;
        break;
      default:
        break;
    }
  });

export default languageProviderReducer;
export { initialState };
