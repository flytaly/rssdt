import FeedParser from 'feedparser';
import { Feed } from '../../entities/Feed';
import { getFeedStream, parseFeed } from '../../feed-parser';
import { logger } from '../../logger';
import { ArgumentError } from '../resolver-types/errors';

export const getFeedVariations = (url: string) => {
  const urlsArray = [{ url }];
  const httpsUrl = url.replace(/^http:\/\//, 'https://');
  if (httpsUrl !== url) {
    urlsArray.push({ url: httpsUrl });
  }
  return urlsArray;
};

export async function processFeed(url: string) {
  let feed = await Feed.findOne({ where: getFeedVariations(url) });
  if (feed) return { feed };
  let feedMeta: FeedParser.Meta;
  let feedItems: FeedParser.Item[];
  let newUrl: string = url;
  try {
    const { feedStream, feedUrl } = await getFeedStream(url, { timeout: 6000 }, true);
    newUrl = feedUrl;
    ({ feedMeta, feedItems } = await parseFeed(feedStream));
    if (!feedMeta) throw new Error('Not a feed');
  } catch (e) {
    if (e.message === 'Not a feed') {
      return { errors: [new ArgumentError('url', e.message)] };
    }
    logger.error(`Couldn't get access to feed: ${url}. ${e.code} ${e.message}`);
    return { errors: [new ArgumentError('url', `Couldn't get access to feed`)] };
  }
  // actual url of the feed
  if (newUrl !== url) {
    url = newUrl;
    feed = await Feed.findOne({ where: getFeedVariations(url) });
  }
  return { feedMeta, feedItems, url, feed };
}
