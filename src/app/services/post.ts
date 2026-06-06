import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  CreatePostPayload,
  PagedPostsResponse,
  PostItem,
  PostsFilterParams,
  UpdatePostPayload,
} from '../models/post';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly postsUrl = new URL('Post', environment.backendUrl).toString();

  getMyPosts(
    pageNumber: number,
    pageSize: number,
    filters: PostsFilterParams = {}
  ): Observable<PagedPostsResponse> {
    let params = new HttpParams()
      .set('PageNumber', String(pageNumber))
      .set('PageSize', String(pageSize));

    if (filters.status) {
      params = params.set('Status', filters.status);
    }
    if (filters.hasPublication !== undefined) {
      params = params.set('HasPublication', String(filters.hasPublication));
    }
    if (filters.titleContains) {
      params = params.set('TitleContains', filters.titleContains);
    }
    if (filters.bodyContains) {
      params = params.set('BodyContains', filters.bodyContains);
    }
    if (filters.publishedOn !== undefined) {
      params = params.set('PublishedOn', String(filters.publishedOn));
    }
    if (filters.createdBefore) {
      params = params.set('CreatedBefore', filters.createdBefore);
    }
    if (filters.createdAfter) {
      params = params.set('CreatedAfter', filters.createdAfter);
    }
    if (filters.sortBy) {
      params = params.set('SortBy', filters.sortBy);
    }
    if (filters.isAscending !== undefined) {
      params = params.set('IsAscending', String(filters.isAscending));
    }

    return this.http.get<PagedPostsResponse>(this.postsUrl, {
      params,
      withCredentials: true,
    });
  }

  getPost(id: number): Observable<PostItem> {
    return this.http.get<PostItem>(`${this.postsUrl}/${id}`, {
      withCredentials: true,
    });
  }

  createPost(payload: CreatePostPayload): Observable<PostItem> {
    return this.http.post<PostItem>(this.postsUrl, payload, {
      withCredentials: true,
    });
  }

  updatePost(id: number, payload: UpdatePostPayload): Observable<PostItem> {
    return this.http.put<PostItem>(`${this.postsUrl}/${id}`, payload, {
      withCredentials: true,
    });
  }
}
