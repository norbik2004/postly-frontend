import type { ParamMap } from '@angular/router';
import {
  POST_SORT_BY_OPTIONS,
  POST_STATUSES,
  type PostSortBy,
  type PostStatus,
  type PostsFilterParams,
} from '../../../models/post';

export type SortOrder = 'newest' | 'oldest';
export type HasPublicationFilter = '' | 'true' | 'false';
export type PlatformFilter = '' | '1' | '2' | '3';
export type StatusFilter = '' | PostStatus;
export type SortByFilter = '' | PostSortBy;

export type PostsListQuery = {
  page: number;
  pageSize: number;
  sort: SortOrder;
  sortBy: SortByFilter;
  status: StatusFilter;
  hasPublication: HasPublicationFilter;
  titleContains: string;
  bodyContains: string;
  publishedOn: PlatformFilter;
  createdAfter: string;
  createdBefore: string;
};

export const DEFAULT_POSTS_LIST_QUERY: PostsListQuery = {
  page: 1,
  pageSize: 10,
  sort: 'newest',
  sortBy: '',
  status: '',
  hasPublication: '',
  titleContains: '',
  bodyContains: '',
  publishedOn: '',
  createdAfter: '',
  createdBefore: '',
};

const PAGE_SIZE_OPTIONS = new Set([10, 20, 50]);
const PLATFORM_VALUES = new Set(['1', '2', '3']);
const SORT_BY_VALUES = new Set(POST_SORT_BY_OPTIONS.map((option) => option.value));

export function postsListQueryToParams(
  query: PostsListQuery
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
  };

  if (query.sortBy) {
    params['sortBy'] = query.sortBy;
  }
  if (query.status) {
    params['status'] = query.status;
  }
  if (query.hasPublication) {
    params['hasPublication'] = query.hasPublication;
  }
  if (query.titleContains.trim()) {
    params['title'] = query.titleContains.trim();
  }
  if (query.bodyContains.trim()) {
    params['body'] = query.bodyContains.trim();
  }
  if (query.publishedOn) {
    params['publishedOn'] = query.publishedOn;
  }
  if (query.createdAfter) {
    params['createdAfter'] = query.createdAfter;
  }
  if (query.createdBefore) {
    params['createdBefore'] = query.createdBefore;
  }

  return params;
}

export function parsePostsListQuery(params: ParamMap): PostsListQuery {
  const page = Number(params.get('page'));
  const pageSize = Number(params.get('pageSize'));
  const sort = params.get('sort');
  const sortBy = params.get('sortBy');
  const status = params.get('status');
  const hasPublication = params.get('hasPublication');
  const publishedOn = params.get('publishedOn');

  return {
    page: Number.isFinite(page) && page >= 1 ? page : DEFAULT_POSTS_LIST_QUERY.page,
    pageSize:
      Number.isFinite(pageSize) && PAGE_SIZE_OPTIONS.has(pageSize)
        ? pageSize
        : DEFAULT_POSTS_LIST_QUERY.pageSize,
    sort: sort === 'oldest' ? 'oldest' : 'newest',
    sortBy: isPostSortBy(sortBy) ? sortBy : '',
    status: isPostStatus(status) ? status : '',
    hasPublication:
      hasPublication === 'true' || hasPublication === 'false' ? hasPublication : '',
    titleContains: params.get('title') ?? '',
    bodyContains: params.get('body') ?? '',
    publishedOn:
      publishedOn && PLATFORM_VALUES.has(publishedOn) ? (publishedOn as PlatformFilter) : '',
    createdAfter: params.get('createdAfter') ?? '',
    createdBefore: params.get('createdBefore') ?? '',
  };
}

export function postsListQueryToFilterParams(query: PostsListQuery): PostsFilterParams {
  const filters: PostsFilterParams = {};

  if (query.status) {
    filters.status = query.status;
  }
  if (query.hasPublication === 'true') {
    filters.hasPublication = true;
  } else if (query.hasPublication === 'false') {
    filters.hasPublication = false;
  }
  if (query.titleContains.trim()) {
    filters.titleContains = query.titleContains.trim();
  }
  if (query.bodyContains.trim()) {
    filters.bodyContains = query.bodyContains.trim();
  }
  if (query.publishedOn) {
    filters.publishedOn = Number(query.publishedOn) as PostsFilterParams['publishedOn'];
  }
  if (query.createdAfter) {
    filters.createdAfter = toIsoDateTime(query.createdAfter, 'start');
  }
  if (query.createdBefore) {
    filters.createdBefore = toIsoDateTime(query.createdBefore, 'end');
  }
  if (query.sortBy) {
    filters.sortBy = query.sortBy;
    filters.isAscending = query.sort === 'oldest';
  }

  return filters;
}

export function hasActiveFilters(query: PostsListQuery): boolean {
  return (
    query.status !== '' ||
    query.hasPublication !== '' ||
    query.titleContains.trim() !== '' ||
    query.bodyContains.trim() !== '' ||
    query.publishedOn !== '' ||
    query.createdAfter !== '' ||
    query.createdBefore !== '' ||
    query.sortBy !== ''
  );
}

export function readPostsListQueryFromHistory(): PostsListQuery | null {
  const state = history.state as { postsReturn?: PostsListQuery } | null;
  const postsReturn = state?.postsReturn;

  if (!postsReturn) {
    return null;
  }

  return parsePostsListQueryFromObject(postsReturn);
}

function parsePostsListQueryFromObject(value: Partial<PostsListQuery>): PostsListQuery {
  return {
    ...DEFAULT_POSTS_LIST_QUERY,
    ...value,
    page:
      Number.isFinite(value.page) && (value.page ?? 0) >= 1
        ? (value.page as number)
        : DEFAULT_POSTS_LIST_QUERY.page,
    pageSize:
      Number.isFinite(value.pageSize) && PAGE_SIZE_OPTIONS.has(value.pageSize as number)
        ? (value.pageSize as number)
        : DEFAULT_POSTS_LIST_QUERY.pageSize,
    sort: value.sort === 'oldest' ? 'oldest' : 'newest',
    sortBy: isPostSortBy(value.sortBy) ? value.sortBy : '',
    status: isPostStatus(value.status) ? value.status : '',
    hasPublication:
      value.hasPublication === 'true' || value.hasPublication === 'false'
        ? value.hasPublication
        : '',
    titleContains: value.titleContains ?? '',
    bodyContains: value.bodyContains ?? '',
    publishedOn:
      value.publishedOn && PLATFORM_VALUES.has(String(value.publishedOn))
        ? (String(value.publishedOn) as PlatformFilter)
        : '',
    createdAfter: value.createdAfter ?? '',
    createdBefore: value.createdBefore ?? '',
  };
}

function isPostStatus(value: string | null | undefined): value is PostStatus {
  return POST_STATUSES.includes(value as PostStatus);
}

function isPostSortBy(value: string | null | undefined): value is PostSortBy {
  return SORT_BY_VALUES.has(value as PostSortBy);
}

function toIsoDateTime(date: string, boundary: 'start' | 'end'): string {
  return boundary === 'start' ? `${date}T00:00:00.000Z` : `${date}T23:59:59.999Z`;
}
