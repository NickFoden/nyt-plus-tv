import React, {useEffect, useState} from 'react';
import Video from 'react-native-video';
import ReactNative, {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TVEventHandler, useTVEventHandler,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
//@ts-expect-error
import {BASE_URL} from 'react-native-dotenv';
import Welcome from "./src/components/Welcome"

const App = () => {
  const [state, setState] = useState({
    welcome:true,
    videos: [],
  });

  const [lastEventType, setLastEventType] = React.useState('');

  const myTVEventHandler = evt => {
    console.log(evt.eventType)
// 'right', 'up','left','down','playPause', 'select'
    setLastEventType(evt.eventType);
  };

  useTVEventHandler(myTVEventHandler);

  const loadVideos = async () => {
    try {
      const result = await fetch(`${BASE_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: `query {
                    videos {
                      collection
                      id
                      name
                      url
                    }
                  }`,
        }),
      })
        .then(r => r.json())
        .then(R => R);
      if (result.data) {
        setState(s => ({...s, videos: result.data.videos}));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);
  
  useEffect(() => {
    setTimeout(() => {
      setState(s => ({...s, welcome:false}))
    }, 1500);
  }, []);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  if(state.welcome){
    return <Welcome />
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        {/* <Header /> */}
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}
        />
        {state.videos.map(I => (
          <View key={I.id}>
            <Text>{I.name}</Text>
          </View>
        ))}
      </ScrollView>
      {state.videos && state.videos[0] && (
        <Video
        controls
          style={styles.backgroundVideo}
          source={{uri: state.videos[0].url}}
        />
      )}
      {/* //  ref={(ref) => {
      //    this.player = ref
      //  }}                                      // Store reference
      //  onBuffer={this.onBuffer}                // Callback when remote video is buffering
      //  onError={this.videoError}               // Callback when video cannot be loaded
      //  style={styles.backgroundVideo}  */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    height:500,
  },
});

export default App;
