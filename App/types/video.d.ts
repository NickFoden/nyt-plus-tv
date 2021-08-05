declare module 'nyt-plus' {
  export interface NYTVideo {
    id: string;
    byline: string;
    category: string;
    cursor: string;
    headline: string;
    promotionalMedia: {credit: string; url: string};
    summary: string;
    tags: string[];
    video: {type: string; url: string};
  }

  export interface WatchedVideo extends NYTVideo {
    currentPlayBackTime: number
  }
}
