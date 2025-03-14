import { legacy_createStore as createStore, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';
import rootReducer from './rootReducer';
import { fetchSettings } from './Settings/reducer';
import { fetchKotTypes } from './newOrder/action';

const Store = createStore(rootReducer, applyMiddleware(thunk));

Store.dispatch(fetchSettings());

Store.dispatch(fetchKotTypes());


export default Store;