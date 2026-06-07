import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, take } from 'rxjs';
import { toApplicationError } from '../../../models/application-error';
import { PLATFORM_TYPES, POST_SORT_BY_OPTIONS, POST_STATUSES, parseHashtagSegments, type PagedPostsResponse } from '../../../models/post';
import { PostService } from '../../../services/post';
import {
  DEFAULT_POSTS_LIST_QUERY,
  hasActiveFilters,
  parsePostsListQuery,
  postsListQueryToFilterParams,
  postsListQueryToParams,
  type HasPublicationFilter,
  type PlatformFilter,
  type PostsListQuery,
  type SortByFilter,
  type SortOrder,
  type StatusFilter,
} from './posts-list-query';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type PostsForm = FormGroup<{
  pageNumber: FormControl<number>;
  pageSize: FormControl<number>;
  sortOrder: FormControl<SortOrder>;
  sortBy: FormControl<SortByFilter>;
  status: FormControl<StatusFilter>;
  hasPublication: FormControl<HasPublicationFilter>;
  titleContains: FormControl<string>;
  bodyContains: FormControl<string>;
  publishedOn: FormControl<PlatformFilter>;
  createdAfter: FormControl<string>;
  createdBefore: FormControl<string>;
}>;

@Component({
  selector: 'app-dashboard-posts',
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  styleUrl: './dashboard-posts.scss',
  template: `
    <section class="dashboard-content-page dashboard-posts" aria-labelledby="dashboard-posts-title">
      <div class="dashboard-posts__intro">
        <header class="dashboard-posts__header">
          <div class="dashboard-posts__header-row">
            <div class="dashboard-posts__header-copy">
              <p class="section-eyebrow dashboard-posts__eyebrow">Content</p>
              <h1 id="dashboard-posts-title" class="dashboard-posts__title">Posts</h1>
            </div>
            <a
              class="dashboard-posts__add-btn"
              [routerLink]="['/dashboard/posts/new']"
              [state]="postsReturnState()"
            >
              <span class="material-icons dashboard-posts__add-icon" aria-hidden="true">add</span>
              Add post
            </a>
          </div>
        </header>

        <form
          class="posts-filters"
          [formGroup]="form"
          (ngSubmit)="applyFilters()"
          aria-label="Filter posts"
        >
          <div class="posts-filters__grid">
            <div class="posts-filters__row posts-filters__row--meta">
            <div class="field field--compact">
              <label class="field__label" for="filter-sort-by">Sort</label>
              <select
                id="filter-sort-by"
                class="field__input field__input--select"
                formControlName="sortBy"
              >
                <option value="">Default</option>
                @for (option of sortByOptions; track option.value) {
                  <option [value]="option.value">{{ option.label }}</option>
                }
              </select>
            </div>

            <div class="field field--compact field--sort-order">
              <span class="field__label" id="filter-sort-order-label">Order</span>
              <div class="posts-sort-order" role="group" aria-labelledby="filter-sort-order-label">
                <button
                  type="button"
                  class="posts-sort-order__btn"
                  [class.is-active]="form.controls.sortOrder.value === 'newest'"
                  [disabled]="!form.controls.sortBy.value || isLoading()"
                  aria-label="Descending"
                  (click)="setSortOrder('newest')"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="posts-sort-order__btn"
                  [class.is-active]="form.controls.sortOrder.value === 'oldest'"
                  [disabled]="!form.controls.sortBy.value || isLoading()"
                  aria-label="Ascending"
                  (click)="setSortOrder('oldest')"
                >
                  ↑
                </button>
              </div>
            </div>

            <div class="field field--compact">
              <label class="field__label" for="filter-status">Status</label>
              <select id="filter-status" class="field__input field__input--select" formControlName="status">
                <option value="">Any status</option>
                @for (status of postStatuses; track status) {
                  <option [value]="status">{{ status }}</option>
                }
              </select>
            </div>

            <div class="field field--compact">
              <label class="field__label" for="filter-has-publication">Publication</label>
              <select
                id="filter-has-publication"
                class="field__input field__input--select"
                formControlName="hasPublication"
              >
                <option value="">Any</option>
                <option value="true">Published</option>
                <option value="false">Not published</option>
              </select>
            </div>

            <div class="field field--compact">
              <label class="field__label" for="filter-platform">Platform</label>
              <select
                id="filter-platform"
                class="field__input field__input--select"
                formControlName="publishedOn"
              >
                <option value="">Any platform</option>
                @for (platform of platformTypes; track platform.value) {
                  <option [value]="platform.value">{{ platform.label }}</option>
                }
              </select>
            </div>
          </div>

          <div class="posts-filters__row posts-filters__row--search">
            <div class="field field--grow">
              <label class="field__label" for="filter-title">Title contains</label>
              <input
                id="filter-title"
                class="field__input"
                type="text"
                formControlName="titleContains"
                autocomplete="off"
                placeholder="Search title…"
              />
            </div>

            <div class="field field--grow">
              <label class="field__label" for="filter-body">Body contains</label>
              <input
                id="filter-body"
                class="field__input"
                type="text"
                formControlName="bodyContains"
                autocomplete="off"
                placeholder="Search content…"
              />
            </div>

            <div class="field field--compact field--date">
              <label class="field__label" for="filter-created-after">Created after</label>
              <input
                id="filter-created-after"
                class="field__input"
                type="date"
                formControlName="createdAfter"
              />
            </div>

            <div class="field field--compact field--date">
              <label class="field__label" for="filter-created-before">Created before</label>
              <input
                id="filter-created-before"
                class="field__input"
                type="date"
                formControlName="createdBefore"
              />
            </div>

            <div class="posts-filters__actions">
              <button type="submit" class="btn btn--primary" [disabled]="isLoading()">Apply filters</button>
              <button
                type="button"
                class="btn btn--secondary"
                [disabled]="isLoading() || !filtersActive()"
                (click)="clearFilters()"
              >
                Clear filters
              </button>
            </div>
          </div>
          </div>
        </form>
      </div>

      @if (errorMessage()) {
        <p class="posts-status posts-status--error" role="alert">{{ errorMessage() }}</p>
      }

      @if (isLoading() && !result()) {
        <p class="posts-status" aria-live="polite">Loading posts…</p>
      }

      @if (result(); as page) {
        @if (page.items.length === 0) {
          <p class="posts-status">
            {{ filtersActive() ? 'No posts match your filters.' : 'No posts yet.' }}
          </p>
        } @else {
          <div class="posts-board">
            <div class="posts-board__head">
              <p class="posts-board__count" aria-live="polite">
                <strong>{{ page.items.length }}</strong>
                {{ page.items.length === 1 ? 'post' : 'posts' }} on this page
              </p>
            </div>
            <ul class="posts-list">
            @for (post of page.items; track post.id) {
              <li>
                <a
                  class="post-card"
                  [routerLink]="['/dashboard/posts', post.id]"
                  [state]="postsReturnState()"
                >
                  <div class="post-card__head">
                    <h2 class="post-card__title">{{ post.title || 'Untitled' }}</h2>
                    <span class="post-card__status">{{ post.status }}</span>
                  </div>
                  @if (post.body) {
                    <p class="post-card__body">
                      @for (segment of hashtagSegments(post.body); track $index) {
                        @if (segment.highlighted) {
                          <span class="hashtag">{{ segment.text }}</span>
                        } @else {
                          {{ segment.text }}
                        }
                      }
                    </p>
                  }
                  @else {
                    <p class="post-card__body">No content yet.</p>
                  }
                  @if (post.promptText) {
                    <p class="post-card__prompt">
                      <span class="post-card__label">Prompt:</span> {{ post.promptText }}
                    </p>
                  }
                  <p class="post-card__meta">
                    <time [attr.datetime]="post.createdAt">{{ post.createdAt | date: 'medium' }}</time>
                  </p>
                </a>
              </li>
            }
            </ul>
          </div>
        }
      }

      <footer class="posts-footer" [formGroup]="form" aria-label="Posts pagination">
        @if (result(); as page) {
          <div class="posts-footer__row">
            <p class="posts-footer__meta" aria-live="polite">
              Page <strong>{{ page.pageIndex }}</strong>
              @if (page.totalPages > 0) {
                of <strong>{{ page.totalPages }}</strong>
              }
            </p>

            <div class="posts-footer__controls">
              <div class="field field--compact field--inline">
                <label class="field__label" for="pageSize">Per page</label>
                <select
                  id="pageSize"
                  class="field__input field__input--select"
                  formControlName="pageSize"
                  [disabled]="isLoading()"
                  (change)="onPageSizeChange()"
                >
                  @for (size of pageSizeOptions; track size) {
                    <option [value]="size">{{ size }}</option>
                  }
                </select>
              </div>

              <div class="posts-pager">
                <button
                  type="button"
                  class="btn btn--secondary"
                  [disabled]="isLoading() || !result()?.hasPreviousPage"
                  (click)="goToPrevious()"
                >
                  Previous
                </button>
                <button
                  type="button"
                  class="btn btn--secondary"
                  [disabled]="isLoading() || !result()?.hasNextPage"
                  (click)="goToNext()"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        }
      </footer>
    </section>
  `,
})
export class DashboardPosts {
  private readonly postService = inject(PostService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly postStatuses = POST_STATUSES;
  protected readonly platformTypes = PLATFORM_TYPES;
  protected readonly sortByOptions = POST_SORT_BY_OPTIONS;
  protected readonly hashtagSegments = parseHashtagSegments;

  protected readonly form: PostsForm = new FormGroup({
    pageNumber: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    pageSize: new FormControl(10, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
    }),
    sortOrder: new FormControl<SortOrder>('newest', { nonNullable: true }),
    sortBy: new FormControl<SortByFilter>('', { nonNullable: true }),
    status: new FormControl<StatusFilter>('', { nonNullable: true }),
    hasPublication: new FormControl<HasPublicationFilter>('', { nonNullable: true }),
    titleContains: new FormControl('', { nonNullable: true }),
    bodyContains: new FormControl('', { nonNullable: true }),
    publishedOn: new FormControl<PlatformFilter>('', { nonNullable: true }),
    createdAfter: new FormControl('', { nonNullable: true }),
    createdBefore: new FormControl('', { nonNullable: true }),
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly result = signal<PagedPostsResponse | null>(null);

  constructor() {
    this.route.queryParamMap.pipe(take(1)).subscribe((params) => {
      const query = parsePostsListQuery(params);
      this.applyListQuery(query);
      this.loadPosts();
    });
  }

  protected postsReturnState(): { postsReturn: PostsListQuery } {
    return { postsReturn: this.currentListQuery() };
  }

  protected filtersActive(): boolean {
    return hasActiveFilters(this.currentListQuery());
  }

  protected applyFilters(): void {
    this.form.patchValue({ pageNumber: 1 });
    this.loadPosts();
  }

  protected setSortOrder(order: SortOrder): void {
    this.form.patchValue({ sortOrder: order });
  }

  protected clearFilters(): void {
    this.form.patchValue({
      pageNumber: 1,
      sortBy: DEFAULT_POSTS_LIST_QUERY.sortBy,
      sortOrder: DEFAULT_POSTS_LIST_QUERY.sort,
      status: DEFAULT_POSTS_LIST_QUERY.status,
      hasPublication: DEFAULT_POSTS_LIST_QUERY.hasPublication,
      titleContains: DEFAULT_POSTS_LIST_QUERY.titleContains,
      bodyContains: DEFAULT_POSTS_LIST_QUERY.bodyContains,
      publishedOn: DEFAULT_POSTS_LIST_QUERY.publishedOn,
      createdAfter: DEFAULT_POSTS_LIST_QUERY.createdAfter,
      createdBefore: DEFAULT_POSTS_LIST_QUERY.createdBefore,
    });
    this.loadPosts();
  }

  protected onPageSizeChange(): void {
    this.form.patchValue({ pageNumber: 1 });
    this.loadPosts();
  }

  protected loadPosts(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const query = this.currentListQuery();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postService
      .getMyPosts(query.page, query.pageSize, postsListQueryToFilterParams(query))
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.form.patchValue({ pageNumber: response.pageIndex }, { emitEvent: false });
          this.syncQueryParams();
        },
        error: (error) => {
          this.result.set(null);
          this.errorMessage.set(toApplicationError(error, 'Could not load posts.').description);
        },
      });
  }

  protected goToPrevious(): void {
    const page = this.result();
    if (!page?.hasPreviousPage) {
      return;
    }
    this.form.patchValue({ pageNumber: Math.max(1, page.pageIndex - 1) });
    this.loadPosts();
  }

  protected goToNext(): void {
    const page = this.result();
    if (!page?.hasNextPage) {
      return;
    }
    this.form.patchValue({ pageNumber: page.pageIndex + 1 });
    this.loadPosts();
  }

  private currentListQuery(): PostsListQuery {
    const {
      pageNumber,
      pageSize,
      sortOrder,
      sortBy,
      status,
      hasPublication,
      titleContains,
      bodyContains,
      publishedOn,
      createdAfter,
      createdBefore,
    } = this.form.getRawValue();

    return {
      page: pageNumber,
      pageSize,
      sort: sortOrder,
      sortBy,
      status,
      hasPublication,
      titleContains,
      bodyContains,
      publishedOn,
      createdAfter,
      createdBefore,
    };
  }

  private applyListQuery(query: PostsListQuery): void {
    this.form.patchValue(
      {
        pageNumber: query.page,
        pageSize: query.pageSize,
        sortOrder: query.sort,
        sortBy: query.sortBy,
        status: query.status,
        hasPublication: query.hasPublication,
        titleContains: query.titleContains,
        bodyContains: query.bodyContains,
        publishedOn: query.publishedOn,
        createdAfter: query.createdAfter,
        createdBefore: query.createdBefore,
      },
      { emitEvent: false }
    );
  }

  private syncQueryParams(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: postsListQueryToParams(this.currentListQuery()),
      replaceUrl: true,
    });
  }
}
