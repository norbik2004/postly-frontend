export type PostItem = {
  id: number;
  title: string;
  promptText: string;
  userId: string;
  body: string;
  status: string;
  createdAt: string;
};

export type PagedPostsResponse = {
  pageIndex: number;
  totalPages: number;
  items: PostItem[];
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
