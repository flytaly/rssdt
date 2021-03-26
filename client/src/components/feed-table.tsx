import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import EditIcon from '../../public/static/edit.svg';
import TrashIcon from '../../public/static/trash.svg';
import { useDeleteMyFeedsMutation, UserFeed } from '../generated/graphql';
import { SortableColumn, useSortableState } from '../hooks/use-sortableState';
import { periodNames } from '../types';
import { updateAfterDelete as update } from '../utils/update-after-delete';
import ConfirmModal from './modals/confirm-modal';
import EditFeedModal from './modals/edit-feed-modal';

type FeedTableProps = {
  feeds: Array<UserFeed>;
};

interface CellProps {
  children: React.ReactNode;
  name?: string;
  header?: boolean;
  className?: string;
}

const Cell: React.FC<CellProps> = ({ children, className = '', name = '', header = false }) => {
  return React.createElement(
    header ? 'th' : 'td',
    { className: `feed-table-column ${className}`, 'data-name': name },
    children,
  );
};

interface RowProps {
  children: React.ReactNode;
  isOdd?: boolean;
}
const Row: React.FC<RowProps> = ({ children, isOdd = true }) => (
  <tr
    className={`grid feed-table-template gap-2 py-4 sm:py-1 hover:bg-primary-2 ${
      isOdd ? '' : 'bg-gray-200'
    }`}
  >
    {children}
  </tr>
);

const HeaderRow: React.FC = ({ children }) => (
  <tr className="feed-table-template hidden sm:grid gap-2 font-bold  py-4 sm:py-1 hover:bg-primary-2">
    {children}
  </tr>
);

const ConfirmDeleteMsg: React.FC<{ feeds: UserFeed[]; error?: string }> = ({ feeds, error }) => (
  <div>
    Are you sure you want to delete the feeds:{' '}
    <ul>
      {feeds.map((uf) => (
        <li key={uf.id}>
          <b>{uf.title || uf.feed.title}</b>
        </li>
      ))}
    </ul>
    <div className="text-error">{error}</div>
  </div>
);

const formatDigestDate = (date?: string) => (date ? new Date(date).toLocaleString() : '-');
const formatCreatedDate = (date: string) => new Date(date).toLocaleDateString();

const FeedTable: React.FC<FeedTableProps> = ({ feeds }) => {
  const [feedsToDelete, setFeedsToDelete] = useState<UserFeed[]>([]);
  const [editingFeed, setEditingFeed] = useState<UserFeed | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteMyFeeds, { loading }] = useDeleteMyFeedsMutation();
  const { getSortIcon, incSort, sortState, sortUserFeeds } = useSortableState();

  const getHeaderButton = (col: SortableColumn, name: string) => (
    <button
      type="button"
      className="flex items-center font-bold w-full group"
      onClick={() => incSort(col)}
    >
      <span>{name}</span>
      {getSortIcon(col)}
    </button>
  );

  const closeModal = () => {
    setDeleteError('');
    setFeedsToDelete([]);
  };

  const sortedFeeds = useMemo(() => {
    if (!sortState.col || !sortState.dir) return feeds;
    return sortUserFeeds(feeds, sortState.col, sortState.dir);
  }, [feeds, sortState.col, sortState.dir, sortUserFeeds]);

  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <HeaderRow>
            <Cell name="Feed">{getHeaderButton('title', 'Feed')}</Cell>
            <Cell name="Added">{getHeaderButton('added', 'Added')}</Cell>
            <Cell name="Latest digest date">
              {getHeaderButton('digest_date', 'Latest digest date')}
            </Cell>
            <Cell name="Latest item pubdate">
              {getHeaderButton('item_pubdate', 'Latest item pubdate')}
            </Cell>
            <Cell name="Digest Schedule">Digest Schedule</Cell>
            <Cell name="Actions">Actions</Cell>
          </HeaderRow>
        </thead>
        <tbody>
          {sortedFeeds.map((uf, idx) => (
            <Row isOdd={!(idx % 2)} key={uf.id}>
              <Cell name="Feed">
                <Link href={`/feed/${uf.id}`}>
                  <a className="underline">{uf.title || uf.feed.title}</a>
                </Link>
              </Cell>
              <Cell className="text-xs" name="Added">
                {formatCreatedDate(uf.createdAt)}
              </Cell>
              <Cell className="text-xs" name="Latest digest date">
                {formatDigestDate(uf.lastDigestSentAt)}
              </Cell>
              <Cell className="text-xs" name="Latest item pubdate">
                {formatDigestDate(uf.feed.lastPubdate)}
              </Cell>
              <Cell name="Digest Schedule">
                {periodNames[uf.schedule] !== periodNames.disable ? (
                  <span className="font-medium">{periodNames[uf.schedule]}</span>
                ) : (
                  <span className="text-gray-400">disabled</span>
                )}
              </Cell>
              <Cell name="Actions">
                <button onClick={() => setEditingFeed(uf)} type="button" className="icon-btn">
                  <EditIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFeedsToDelete([uf])}
                  type="button"
                  className="icon-btn text-red-800"
                >
                  <TrashIcon className="w-4 h-4 mr-1 " />
                </button>
              </Cell>
            </Row>
          ))}
        </tbody>
      </table>
      <ConfirmModal
        isOpen={!!feedsToDelete.length}
        closeModal={closeModal}
        onConfirm={async () => {
          const ids = feedsToDelete.map(({ id }) => id);
          const result = await deleteMyFeeds({ variables: { ids }, update });
          if (result.errors?.length) setDeleteError("Couldn't delete feeds");
          else closeModal();
        }}
        disableButtons={loading}
        error={deleteError}
        message={<ConfirmDeleteMsg feeds={feedsToDelete} />}
      />
      <EditFeedModal
        feed={editingFeed}
        isOpen={!!editingFeed}
        closeModal={() => setEditingFeed(null)}
      />
    </div>
  );
};

export default FeedTable;
