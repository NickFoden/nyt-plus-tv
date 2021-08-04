import {applyMiddleware, createStore} from 'redux';
// import createSagaMiddleware from 'redux-saga';
import {composeWithDevTools} from 'redux-devtools-extension';
import {persistStore, persistReducer} from 'redux-persist';
import thunkMiddleware from 'redux-thunk';
import AsyncStorage from '@react-native-async-storage/async-storage';

import rootReducer from './reducer';
// import rootSaga from './sagas';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['content', 'user', 'posts', 'profiles'],
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export default function configureStore() {
  // const sagaMiddleware = createSagaMiddleware();
  const store = createStore(
    persistedReducer,
    composeWithDevTools(applyMiddleware(thunkMiddleware)),
  );
  //   sagaMiddleware.run(rootSaga);
  const persistor = persistStore(store);
  return {store, persistor};
}