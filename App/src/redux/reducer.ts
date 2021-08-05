import {WatchedVideo} from "nyt-plus"
import { useSelector, TypedUseSelectorHook } from "react-redux";

const initialState = {
    watched:[] as WatchedVideo[]
}

const rootReducer = (state = initialState, action: {type:string, video:WatchedVideo}) => {
    switch (action.type) {
      case "ADD_WATCHED":{
        return {...state, watched: [action.video, ...state.watched.filter(I => I.id !== action.video.id)]}
      }
      default:
        return state;
    }
  };
  
  export type RootState = ReturnType<typeof rootReducer>;

  export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

  export default rootReducer;