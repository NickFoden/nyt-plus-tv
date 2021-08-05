import {WatchedVideo} from 'nyt-plus';

export const saveWatchedVideo = (V: WatchedVideo) => dispatch => {
  dispatch({
    type: 'ADD_WATCHED',
    video: V,
  });
};
