import 'react-native/tvos-types.d';
import React, {useEffect, useState} from 'react';
import {AppRegistry, LogBox, Settings} from 'react-native';
import {Provider} from 'react-redux';
import uuid from 'react-native-uuid';
import * as eva from '@eva-design/eva';
import { ApplicationProvider } from '@ui-kitten/components';
import App from './App';
import {name as appName} from './app.json';
import configureStore from './App/src/redux/store';



const NYT = () => {
  LogBox.ignoreLogs(['Warning: ...']);
  // LogBox.ignoreAllLogs()
  const {store} = configureStore();
  const [userId, setUserId] = useState<string | number[]>("0");

  const loadUserId = () => {
    // const id = Settings.get('nyt-plus-tv-id');
    // if (id) {
    //   setUserId(id);
    // } else {
      const uid = uuid.v4()
      Settings.set({'nyt-plus-tv-id': uid});
      setUserId(uid);
    // }
  };
  useEffect(() => {
    loadUserId();
  }, []);

  return (
    <ApplicationProvider {...eva} theme={eva.dark}>
    <Provider store={store}>
      <App userId={userId} />
    </Provider>
    </ApplicationProvider>
  );
};
AppRegistry.registerComponent(appName, () => NYT);
