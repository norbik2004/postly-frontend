import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { PagedPostsResponse } from '../models/post';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly myPostsUrl = new URL('Post/myPosts', environment.backendUrl).toString();

  getMyPosts(
    pageNumber: number,
    pageSize: number,
    isAscending = false
  ): Observable<PagedPostsResponse> {
    const params = new HttpParams()
      .set('PageNumber', String(pageNumber))
      .set('PageSize', String(pageSize))
      .set('IsAscending', String(isAscending));

    return this.http.get<PagedPostsResponse>(this.myPostsUrl, {
      params,
      withCredentials: true,
    });
  }
}
