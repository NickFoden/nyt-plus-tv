declare module 'nyt-plus' {
  export interface NYTVideo {
    _id: string;
    byline: string;
    category: string;
    cursor: string;
    headline: string;
    promotionalMediaCredit: string;
    promotionalMediaUrl: string;
    summary: string;
    tags: string[];
    videoType: string;
    videoUrl: string;
  }

  export interface WatchedVideo extends NYTVideo {
    currentPlayBackTime: number;
  }
}
