import 'react-native/tvos-types.d';
import React, {useEffect, useState} from 'react';
import {AppRegistry, Settings} from 'react-native';
import {Provider} from 'react-redux';
import App from './App';
import {name as appName} from './app.json';
import configureStore from './App/src/redux/store';

const NYT = () => {
  const {store} = configureStore();
  const [userId, setUserId] = useState<number>(0);

  const loadUserId = () => {
    const id = Settings.get('nyt-plus-tv-id');
    if (id) {
      setUserId(id);
    } else {
      const uuid = Math.random();
      Settings.set({'nyt-plus-tv-id': uuid});
      setUserId(uuid);
    }
  };
  useEffect(() => {
    loadUserId();
  }, []);

  return (
    <Provider store={store}>
      <App userId={userId} />
    </Provider>
  );
};
AppRegistry.registerComponent(appName, () => NYT);
