import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { toApplicationError } from '../../../models/application-error';
import type { PagedPostsResponse } from '../../../models/post';
import { PostService } from '../../../services/post';

const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type SortOrder = 'newest' | 'oldest';

type PostsForm = FormGroup<{
  pageNumber: FormControl<number>;
  pageSize: FormControl<number>;
  sortOrder: FormControl<SortOrder>;
}>;

@Component({
  selector: 'app-dashboard-posts',
  imports: [ReactiveFormsModule, DatePipe],
  styleUrl: './dashboard-posts.scss',
  template: `
    <section class="dashboard-posts" aria-labelledby="dashboard-posts-title">
      <header class="dashboard-posts__header">
        <p class="section-eyebrow">Content</p>
        <h1 id="dashboard-posts-title" class="dashboard-posts__title">Posts</h1>
        <p class="dashboard-posts__lead">Browse your generated posts.</p>
      </header>

      @if (errorMessage()) {
        <p class="posts-status posts-status--error" role="alert">{{ errorMessage() }}</p>
      }

      @if (isLoading() && !result()) {
        <p class="posts-status" aria-live="polite">Loading posts…</p>
      }

      @if (result(); as page) {
        @if (page.items.length === 0) {
          <p class="posts-status">No posts yet.</p>
        } @else {
          <ul class="posts-list">
            @for (post of page.items; track post.id) {
              <li class="post-card">
                <div class="post-card__head">
                  <h2 class="post-card__title">{{ post.title || 'Untitled' }}</h2>
                  <span class="post-card__status">{{ post.status }}</span>
                </div>
                @if (post.promptText) {
                  <p class="post-card__prompt">
                    <span class="post-card__label">Prompt:</span> {{ post.promptText }}
                  </p>
                }
                @if (post.body) {
                  <p class="post-card__body">{{ post.body }}</p>
                }
                <p class="post-card__meta">
                  <time [attr.datetime]="post.createdAt">{{ post.createdAt | date: 'medium' }}</time>
                </p>
              </li>
            }
          </ul>
        }
      }

      <footer class="posts-footer" [formGroup]="form" aria-label="Posts pagination">
        @if (result(); as page) {
          <p class="posts-footer__meta" aria-live="polite">
            Page <strong>{{ page.pageIndex }}</strong>
            @if (page.totalPages > 0) {
              of <strong>{{ page.totalPages }}</strong>
            }
            · {{ page.items.length }} on this page
          </p>
        }

        <div class="posts-footer__controls">
          <div class="field field--compact">
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

          <div class="field field--compact">
            <label class="field__label" for="sortOrder">Sort</label>
            <select
              id="sortOrder"
              class="field__input field__input--select"
              formControlName="sortOrder"
              [disabled]="isLoading()"
              (change)="onSortChange()"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
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
      </footer>
    </section>
  `,
})
export class DashboardPosts {
  private readonly postService = inject(PostService);

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

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
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly result = signal<PagedPostsResponse | null>(null);

  constructor() {
    this.loadPosts();
  }

  protected onPageSizeChange(): void {
    this.form.patchValue({ pageNumber: 1 });
    this.loadPosts();
  }

  protected onSortChange(): void {
    this.form.patchValue({ pageNumber: 1 });
    this.loadPosts();
  }

  protected loadPosts(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { pageNumber, pageSize, sortOrder } = this.form.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postService
      .getMyPosts(pageNumber, pageSize, sortOrder === 'oldest')
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.form.patchValue({ pageNumber: response.pageIndex }, { emitEvent: false });
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
}
