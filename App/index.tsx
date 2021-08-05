import React, {useEffect, useRef, useState} from 'react';
import Video from 'react-native-video';
import {useDispatch, useSelector} from 'react-redux';
import ReactNative, {
  // BackHandler,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  // TVEventHandler,
  //@ts-expect-error
  useTVEventHandler,
  useColorScheme,
  View,
} from 'react-native';
import {NYTVideo} from 'nyt-plus';

import {Colors} from 'react-native/Libraries/NewAppScreen';
//@ts-expect-error
import {BASE_URL} from 'react-native-dotenv';
import Welcome from './src/components/Welcome';
import {saveWatchedVideo} from './src/redux/action';
import {useTypedSelector} from './src/redux/reducer';

const App = ({userId}) => {
  const currentPlayBack = useRef(0);
  const videoRef = useRef(null);
  const dispatch = useDispatch();
  const watchedVideos = useTypedSelector(state => state.watched);
  const width = Dimensions.get('window').width;
  const [state, setState] = useState<{
    selected: string;
    preview: string;
    searchActive: boolean;
    searchQuery: string;
    welcome: boolean;
    videos: NYTVideo[];
  }>({
    // selected: '306103814828589636',
    selected: '',
    preview: '306103814828589636',
    searchActive: false,
    searchQuery: '',
    welcome: true,
    videos: [],
  });

  // useEffect(() => {
  //   const backAction = () => {
  //     setState(S => ({...S, selected: ''}));
  //     return true;
  //   };

  //   const backHandler = BackHandler.addEventListener(
  //     'hardwareBackPress',
  //     backAction,
  //   );

  //   return () => backHandler.remove();
  // }, []);

  const myTVEventHandler = evt => {
    console.log(evt.eventType);
    if (state.selected && state.videos[0] && evt.eventType === 'select') {
      const currentVideo = state.videos.find(V => V.id === state.selected);
      if (currentVideo) {
        dispatch(
          saveWatchedVideo({
            currentPlayBackTime: currentPlayBack.current,
            ...currentVideo,
          }),
        );
      }
      setState(S => ({...S, selected: ''}));
    }
    // 'right', 'up','left','down','playPause', 'select'
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
                      id
                      byline
                      category
                      cursor
                      headline
                      promotionalMedia{
                        credit
                        url
                      }
                      summary
                      video {
                        type
                        url
                      }
                      tags
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

  const loadUser = async () => {
    console.log(userId);
  };

  useEffect(() => {
    loadUser();
    loadVideos();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setState(s => ({...s, welcome: false}));
    }, 1500);
  }, []);
  const handleRandom = () => {
    const randomVideo =
      state.videos[Math.floor(Math.random() * state.videos.length)];
    setState(S => ({...S, selected: randomVideo.id}));
  };

  const handleSearch = (s: string) => {
    setState(S => ({...S, searchQuery: s}));
  };
  
  const handleStartSearch = () => {
    setState(S => ({...S, searchActive: true}));
  };

  if (state.welcome) {
    return <Welcome />;
  }

  const currentVideo = state.videos.find(V => V.id === state.selected);

  if (currentVideo) {
    const alreadyStarted = watchedVideos.find(W => W.id === state.selected);
    return (
      <Video
        ref={videoRef}
        controls
        onProgress={(V: {
          currentTime: number;
          playableDuration: number;
          seekableDuration: number;
        }) => {
          // KEEP TRACK OF CURRENT PLAYBACK TIME CODE
          currentPlayBack.current = V.currentTime;
        }}
        fullscreen
        style={styles.backgroundVideo}
        source={{uri: currentVideo.video.url}}
        onLoad={() => {
          // SKIP AHEAD TO RESUME IF ALREADY STARTED
          if (alreadyStarted && alreadyStarted.currentPlayBackTime > 0)
            videoRef.current.seek(alreadyStarted.currentPlayBackTime);
        }}
      />
    );
  }

  if (state.searchActive) {
    console.log(state.searchQuery);
    // FILTER ON HEADLINES FOR NOW
    const filteredVideos = [...state.videos].filter(V =>
      V.headline.toLowerCase().includes(state.searchQuery.toLowerCase()),
    );
    return (
      <SafeAreaView style={{backgroundColor: 'black'}}>
        <View style={{backgroundColor: 'black', height: '100%'}}>
          <TextInput
            onChangeText={handleSearch}
            style={{backgroundColor: 'white', color: 'black', height: 50}}
          />
          <TouchableOpacity
            onPress={() => {
              setState(S => ({...S, searchActive: false}));
            }}
            style={{
              backgroundColor: 'white',
              padding: 20,
              marginTop: 10,
              width: 200,
            }}>
            <Text style={{color: 'black'}}>Exit</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          // style={styles.FlatlistStyles}
          data={filteredVideos}
          numColumns={6}
          renderItem={({item}) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setState(S => ({...S, selected: item.id}));
              }}
              onFocus={() => {
                setState(S => ({...S, preview: item.id}));
              }}>
              <View>
                <Image
                  style={styles.thumbnail}
                  source={{
                    uri: item.promotionalMedia.url,
                  }}
                />
                <Text style={{color: 'white'}}>
                  {item.headline.slice(0, 15)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={({id}) => id}
        />
      </SafeAreaView>
    );
  }

  const previewVideo = state.videos.find(V => V.id === state.preview);
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <View style={styles.sidebar}>
        <TouchableOpacity style={styles.menuItem} onPress={handleStartSearch}>
          <Text style={{color: 'black'}}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={handleRandom}>
          <Text style={{color: 'black'}}>Random Video</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.mainContent}>
        <View>
          <Image
            style={styles.previewImage}
            source={{
              uri: previewVideo.promotionalMedia.url,
            }}
          />
        </View>
        <Text style={styles.previewTextHeadline}>{previewVideo.headline}</Text>
        <Text style={styles.previewText}>{previewVideo.byline}</Text>
        <Text style={styles.previewText}>{previewVideo.summary}</Text>
        {/* <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollStyle}> */}
        <FlatList
          // style={styles.FlatlistStyles}
          data={state.videos}
          numColumns={6}
          renderItem={({item}) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setState(S => ({...S, selected: item.id}));
              }}
              onFocus={() => {
                setState(S => ({...S, preview: item.id}));
              }}>
              <View>
                <Image
                  style={styles.thumbnail}
                  source={{
                    uri: item.promotionalMedia.url,
                  }}
                />
                <Text style={{color: 'white'}}>
                  {item.headline.slice(0, 15)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={({id}) => id}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: 'black',
    display: 'flex',
    flexDirection: 'row',
  },
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
    // height: 500,
  },
  mainContent: {
    alignItems: 'center',
    marginLeft: -200,
    width: "100%",
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 25,
    marginTop: 50,
  },
  previewImage: {
    resizeMode: 'contain',
    width: 700,
    height: 400,
  },
  previewText: {
    color: 'white',
    marginTop:10,
    maxWidth: 500,
  },
  previewTextHeadline:{
    color: 'white',
    fontSize: 20,
    marginTop:10,
    maxWidth: 500,
  },
  scrollStyle: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  sidebar: {
    backgroundColor: 'blue',
    height: 900,
    width: 200,
  },
  thumbnail: {
    margin: 10,
    width: 150,
    height: 150,
  },
});

export default App;
