import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { PagedPostsResponse } from '../models/post';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly myPostsUrl = new URL('Post/myPosts', environment.backendUrl).toString();

  getMyPosts(pageIndex: number, pageSize: number): Observable<PagedPostsResponse> {
    const params = new HttpParams()
      .set('PageIndex', String(pageIndex))
      .set('PageSize', String(pageSize));

    return this.http.get<PagedPostsResponse>(this.myPostsUrl, {
      params,
      withCredentials: true,
    });
  }
}
