import { zodResolver } from '@hookform/resolvers/zod';
import { archivePageApi, fetchPage, patchPageApi } from '@features/pages/api/pages-api';
import { pageQueryKeys } from '@features/pages/model/query-keys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

const editorSchema = z.object({
  title: z.string().trim().min(1).max(500),
  content: z.string().max(1_000_000),
});

type EditorForm = z.infer<typeof editorSchema>;

export function PageEditorPage() {
  const { workspaceId, pageId } = useParams<{ workspaceId: string; pageId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const pageQuery = useQuery({
    queryKey: pageQueryKeys.detail(pageId ?? ''),
    queryFn: () => fetchPage(pageId ?? ''),
    enabled: pageId !== undefined && pageId.length > 0,
  });

  const form = useForm<EditorForm>({
    resolver: zodResolver(editorSchema),
    defaultValues: { title: '', content: '' },
  });

  useEffect(() => {
    const p = pageQuery.data?.page;
    if (p !== undefined) {
      form.reset({ title: p.title, content: p.content });
    }
  }, [pageQuery.data?.page, form]);

  const saveMut = useMutation({
    mutationFn: (values: EditorForm) => patchPageApi(pageId ?? '', values),
    onSuccess: (res) => {
      qc.setQueryData(pageQueryKeys.detail(pageId ?? ''), res);
      void qc.invalidateQueries({ queryKey: pageQueryKeys.tree(workspaceId ?? '') });
    },
  });

  const archiveMut = useMutation({
    mutationFn: () => archivePageApi(pageId ?? ''),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: pageQueryKeys.tree(workspaceId ?? '') });
      qc.removeQueries({ queryKey: pageQueryKeys.detail(pageId ?? '') });
      navigate(`/dashboard/w/${workspaceId ?? ''}`);
    },
  });

  if (workspaceId === undefined || pageId === undefined) {
    return null;
  }

  if (pageQuery.isPending) {
    return <p className="text-sm text-neutral-500">Loading page</p>;
  }

  if (pageQuery.isError) {
    return (
      <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {pageQuery.error instanceof Error ? pageQuery.error.message : 'Failed to load page'}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <form
        className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm"
        onSubmit={form.handleSubmit((values) => saveMut.mutate(values))}
      >
        <div>
          <label htmlFor="page-title" className="block text-sm font-medium text-neutral-700">
            Title
          </label>
          <input
            id="page-title"
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-lg font-medium"
            {...form.register('title')}
          />
          {form.formState.errors.title !== undefined ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="page-content" className="block text-sm font-medium text-neutral-700">
            Content
          </label>
          <textarea
            id="page-content"
            rows={14}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-mono text-sm"
            {...form.register('content')}
          />
          {form.formState.errors.content !== undefined ? (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.content.message}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saveMut.isPending || !form.formState.isDirty}
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saveMut.isPending ? 'Saving' : 'Save changes'}
          </button>
          <button
            type="button"
            disabled={archiveMut.isPending}
            onClick={() => archiveMut.mutate()}
            className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800 disabled:opacity-50"
          >
            {archiveMut.isPending ? 'Archiving' : 'Archive'}
          </button>
        </div>
        {saveMut.isError ? (
          <p className="text-sm text-red-600">
            {saveMut.error instanceof Error ? saveMut.error.message : 'Save failed'}
          </p>
        ) : null}
      </form>
    </div>
  );
}
