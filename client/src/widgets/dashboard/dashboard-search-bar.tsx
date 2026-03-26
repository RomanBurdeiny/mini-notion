import { searchPagesApi } from '@features/pages/api/pages-api';
import { pageQueryKeys } from '@features/pages/model/query-keys';
import { useDebouncedValue } from '@shared/lib/use-debounced-value';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function DashboardSearchBar() {
  const [raw, setRaw] = useState('');
  const q = useDebouncedValue(raw, 320);
  const enabled = q.length >= 2;

  const searchQuery = useQuery({
    queryKey: pageQueryKeys.search(q),
    queryFn: () => searchPagesApi(q),
    enabled,
  });

  return (
    <div className="border-b border-neutral-200 bg-white px-4 py-3">
      <label htmlFor="global-search" className="sr-only">
        Search pages
      </label>
      <input
        id="global-search"
        type="search"
        placeholder="Search pages (min 2 characters)"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        className="w-full max-w-md rounded border border-neutral-300 px-3 py-2 text-sm"
      />
      {enabled ? (
        <div className="mt-2 max-h-48 overflow-y-auto rounded border border-neutral-200 bg-neutral-50">
          {searchQuery.isPending ? (
            <p className="px-3 py-2 text-sm text-neutral-500">Searching</p>
          ) : searchQuery.isError ? (
            <p className="px-3 py-2 text-sm text-red-600">
              {searchQuery.error instanceof Error
                ? searchQuery.error.message
                : 'Search failed'}
            </p>
          ) : searchQuery.data?.results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-neutral-500">No matches</p>
          ) : (
            <ul className="divide-y divide-neutral-200">
              {searchQuery.data?.results.map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/dashboard/w/${r.workspaceId}/p/${r.id}`}
                    className="block px-3 py-2 text-sm hover:bg-white"
                  >
                    <span className="font-medium text-neutral-900">{r.title || 'Untitled'}</span>
                    <span className="mt-0.5 block line-clamp-1 text-xs text-neutral-500">
                      {r.content.replace(/\s+/g, ' ').slice(0, 120)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
