/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FeedFieldsFragment, UserFeedFieldsFragment } from '../../generated/graphql';
import Spinner from '../spinner';
import XIcon from '../../../public/static/x.svg';

interface FeedSidebarProps {
  feeds?: Array<{ feed: FeedFieldsFragment } & UserFeedFieldsFragment>;
  loading?: boolean;
  onAddFeedClick?: () => void;
  onSidebarClose?: () => void;
}

const FeedSidebar: React.FC<FeedSidebarProps> = ({
  feeds,
  loading,
  onAddFeedClick,
  onSidebarClose,
}) => {
  const router = useRouter();
  const id = router.query.id ? parseInt(router.query.id as string) : null;
  const feedsSorted = useMemo(() => {
    const unread = feeds?.filter((f) => f.newItemsCount) || [];
    const read = feeds?.filter((f) => !f.newItemsCount) || [];
    return unread.concat(read);
  }, [feeds]);

  const list = (
    <ul>
      {feedsSorted?.map((uf) => {
        const hasNew = uf.newItemsCount > 0;
        const font = hasNew ? 'font-semibold text-white' : 'font-light text-gray-200';
        const bg = uf.id === id ? `bg-secondary` : '';
        return (
          <li key={uf.id} title={`${uf.newItemsCount || 0} new items`}>
            <Link href={`/feed/${uf.id}`}>
              <a
                className={`group flex pl-3 focus:ring-2 focus:ring-secondary whitespace-nowrap w-full ${font} ${bg}`}
                onClick={() => onSidebarClose?.()}
              >
                <span className="overflow-ellipsis overflow-hidden group-hover:underline">
                  {uf.title || uf.feed.title || uf.feed.url}
                </span>
                {hasNew ? (
                  <>
                    <div
                      className="flex-shrink-0 ml-1 mt-1 w-1 h-1 rounded-full bg-gray-200
                  bg-opacity-70 group-hover:bg-opacity-100"
                    />
                    <div className="group-hover:text-white text-xs text-gray-400 self-center ml-auto">
                      {uf.newItemsCount}
                    </div>
                  </>
                ) : null}
              </a>
            </Link>
          </li>
        );
      })}
    </ul>
  );
  const content = loading ? <Spinner className="flex justify-center pt-3" /> : list;
  return (
    <div className="bg-sidebar h-full py-2 overflow-hidden">
      {onSidebarClose && (
        <div className="flex justify-end">
          <button type="button" className="btn mr-3" onClick={() => onSidebarClose()}>
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      <nav className="max-w-full text-sm text-gray-50 pr-1 overflow-hidden">{content}</nav>;
      {onAddFeedClick && (
        <button
          type="button"
          className="btn border border-gray-400 block mx-auto mt-8 hover:bg-secondary"
          onClick={() => onAddFeedClick()}
        >
          Add new feed
        </button>
      )}
    </div>
  );
};

export default FeedSidebar;
