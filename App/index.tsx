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
  TVFocusGuideView,
  //@ts-expect-error
  TVTextScrollView,
  //@ts-expect-error
  useTVEventHandler,
  useColorScheme,
  View,
} from 'react-native';
import {NYTVideo} from 'nyt-plus';

import {Colors} from 'react-native/Libraries/NewAppScreen';
//@ts-expect-error
import {BASE_URL, FAUNA_URL, FAUNA_API_SECRET} from 'react-native-dotenv';
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
    category: 'all' | 'opDocs' | 'opinion' | 'diaryOfASong';
    selected: string;
    preferredFocus: number;
    preview: string;
    searchActive: boolean;
    searchQuery: string;
    welcome: boolean;
    videos: NYTVideo[];
  }>({
    category: 'all',
    // selected: '306103814828589636',
    selected: '',
    preferredFocus: 0,
    preview: '306103814828589636',
    searchActive: false,
    searchQuery: '',
    welcome: true,
    videos: [],
  });

  let allVideos = [...state.videos];

  if (state.category !== 'all') {
    allVideos = [...state.videos].filter(V => V.category === state.category);
  }

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

  const myTVEventHandler = (evt: {eventType:string}) => {
    if (
      evt.eventType !== 'blur' &&
      evt.eventType !== 'select' &&
      evt.eventType !== 'focus'
    ) {
      console.log(evt.eventType);
    }
    // EXIT A PLAYING VIDEO
    if (
      state.selected &&
      state.videos.length > 0 &&
      evt.eventType === 'select'
    ) {
      const currentVideo = state.videos.find(V => V._id === state.selected);
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
    //IF IN THE SIDE MENU
    if (state.preferredFocus > 0) { 
      if (evt.eventType === 'swipeRight' || evt.eventType === 'right' ) {
        setState(S => ({...S, preferredFocus: 0}));
      } else if (
        (state.preferredFocus < 6 && evt.eventType === 'swipeDown') ||
        (state.preferredFocus < 6 && evt.eventType === 'down')
      ) {
        setState(S => ({...S, preferredFocus: S.preferredFocus + 1}));
      } else if (
        (state.preferredFocus < 7 && evt.eventType === 'swipeUp') ||
        (state.preferredFocus < 7 && evt.eventType === 'up')
      ) {
        setState(S => ({...S, preferredFocus: S.preferredFocus - 1}));
      }
    }
    // IF IN THUMBNAIL FIELD to gain access to side nav
    const currentIndex = allVideos.findIndex(V => V._id === state.preview);
    if (currentIndex % 6 === 0 && evt.eventType === 'swipeLeft') {
      setState(S => ({...S, preferredFocus: 1}));
    }
    // 'right', 'up','left','down','playPause', 'select'
  };

  useTVEventHandler(myTVEventHandler);

  const loadVideos = async (after: string) => {
    if (!after) {
      try {
        const result = await fetch(`${FAUNA_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${FAUNA_API_SECRET}`,
          },
          body: JSON.stringify({
            query: `
        query {
          videos {
            after
            data {
              _id
              byline
              category
              cursor
              headline
              promotionalMediaUrl
              promotionalMediaCredit
              summary
              tags
              videoType
              videoUrl
            }
          }
        }  
        `,
          }),
        })
          .then(r => r.json())
          .then(R => R);
        if (result?.data?.videos?.data) {
          setState(s => ({...s, videos: result.data.videos.data}));
        }
        if (result.data.videos.after) {
          loadVideos(result.data.videos.after);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        const result = await fetch(`${FAUNA_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${FAUNA_API_SECRET}`,
          },
          body: JSON.stringify({
            query: `
          query {
            videos (
              _cursor: "${after}"
            ) {
              after
              data {
                _id
                byline
                category
                cursor
                headline
                promotionalMediaUrl
                promotionalMediaCredit
                summary
                tags
                videoType
                videoUrl
              }
            }
          }  
          `,
          }),
        })
          .then(r => r.json())
          .then(R => R);

        if (result?.data?.videos?.data) {
          setState(s => ({
            ...s,
            videos: [...s.videos, ...result.data.videos.data],
          }));
        }
        if (result?.data?.videos?.after) {
          loadVideos(result.data.videos.after);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const loadUser = async () => {
    console.log(userId);
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    loadVideos('');
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setState(s => ({...s, welcome: false}));
    }, 1500);
  }, []);
  const handleRandom = () => {
    const randomVideo =
      state.videos[Math.floor(Math.random() * state.videos.length)];
    setState(S => ({...S, selected: randomVideo._id}));
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

  const currentVideo = state.videos.find(V => V._id === state.selected);

  if (currentVideo) {
    const alreadyStarted = watchedVideos.find(W => W._id === state.selected);
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
        source={{uri: currentVideo.videoUrl}}
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
              key={item._id}
              onPress={() => {
                setState(S => ({...S, selected: item._id}));
              }}
              onFocus={() => {
                setState(S => ({...S, preview: item._id}));
              }}>
              <View>
                <Image
                  style={styles.thumbnail}
                  source={{
                    cache: 'default',
                    uri: item.promotionalMediaUrl,
                  }}
                />
                <Text style={{color: 'white'}}>
                  {item.headline.slice(0, 15)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={({_id}) => _id}
        />
      </SafeAreaView>
    );
  }

  const previewVideo =
    allVideos.find(V => V._id === state.preview) || allVideos[0] || {};
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <View style={styles.sidebar}>
        <TVTextScrollView isTVSelectable={true}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleStartSearch}
            hasTVPreferredFocus={state.preferredFocus === 1}>
            <Text style={{color: 'black'}}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setState(s => ({...s, category: 'opDocs'}));
            }}
            hasTVPreferredFocus={state.preferredFocus === 2}>
            <Text style={{color: 'black'}}>Opinion Docs </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            hasTVPreferredFocus={state.preferredFocus === 3}
            onPress={() => {
              setState(s => ({...s, category: 'opinion'}));
            }}>
            <Text style={{color: 'black'}}>Opinion</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            hasTVPreferredFocus={state.preferredFocus === 4}
            onPress={() => {
              setState(s => ({...s, category: 'diaryOfASong'}));
            }}>
            <Text style={{color: 'black'}}>Diary of a Song</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            hasTVPreferredFocus={state.preferredFocus === 5}
            onPress={() => {
              setState(s => ({...s, category: 'all'}));
            }}>
            <Text style={{color: 'black'}}>All Videos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleRandom}
            hasTVPreferredFocus={state.preferredFocus === 6}>
            <Text style={{color: 'black'}}>Random Video</Text>
          </TouchableOpacity>
        </TVTextScrollView>
      </View>
      <View style={styles.mainContent}>
        <View key={previewVideo._id}>
          <Image
            style={styles.previewImage}
            source={{
              cache: 'force-cache',
              uri: previewVideo.promotionalMediaUrl,
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
          data={allVideos}
          numColumns={6}
          renderItem={({item}) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => {
                setState(S => ({...S, selected: item._id}));
              }}
              onFocus={() => {
                setState(S => ({...S, preview: item._id}));
              }}>
              <View>
                <Image
                  style={styles.thumbnail}
                  source={{
                    cache: 'force-cache',
                    uri: item.promotionalMediaUrl,
                  }}
                />
                <Text style={{color: 'white'}}>
                  {item.headline.slice(0, 15)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={({_id}) => _id}
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
    width: '100%',
  },
  menuItem: {
    backgroundColor: 'white',
    borderRadius: 10,
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
    marginTop: 10,
    maxWidth: 500,
  },
  previewTextHeadline: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
    maxWidth: 500,
  },
  scrollStyle: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  sidebar: {
    // backgroundColor: 'blue',
    height: 900,
    paddingTop: 20,
    width: 200,
  },
  thumbnail: {
    margin: 10,
    width: 150,
    height: 150,
  },
});

export default App;
