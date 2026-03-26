import type { PageTreeNodeDto } from '@entities/page/model/types';
import { Link } from 'react-router-dom';

type PageTreeProps = {
  workspaceId: string;
  nodes: PageTreeNodeDto[];
  depth: number;
  onAddChild: (parentId: string) => void;
  activePageId?: string;
};

export function PageTree({ workspaceId, nodes, depth, onAddChild, activePageId }: PageTreeProps) {
  return (
    <ul
      className={
        depth === 0
          ? 'space-y-0.5'
          : 'ml-2 mt-0.5 space-y-0.5 border-l border-neutral-200 pl-2'
      }
    >
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="group flex items-center gap-0.5">
            <Link
              to={`/dashboard/w/${workspaceId}/p/${node.id}`}
              className={`min-w-0 flex-1 truncate rounded px-1.5 py-1 text-sm ${
                activePageId === node.id
                  ? 'bg-neutral-900 font-medium text-white'
                  : 'text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              {node.title.length > 0 ? node.title : 'Untitled'}
            </Link>
            <button
              type="button"
              title="Add subpage"
              className="shrink-0 rounded px-1 py-0.5 text-xs text-neutral-500 opacity-70 hover:bg-neutral-100 hover:opacity-100"
              onClick={() => onAddChild(node.id)}
            >
              +
            </button>
          </div>
          {node.children.length > 0 ? (
            <PageTree
              workspaceId={workspaceId}
              nodes={node.children}
              depth={depth + 1}
              onAddChild={onAddChild}
              activePageId={activePageId}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
