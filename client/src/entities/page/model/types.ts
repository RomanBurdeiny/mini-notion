export type PageDto = {
  id: string;
  title: string;
  content: string;
  icon: string | null;
  workspaceId: string;
  authorId: string;
  parentPageId: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PageTreeNodeDto = PageDto & {
  children: PageTreeNodeDto[];
};
