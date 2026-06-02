import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { toApplicationError } from '../../../models/application-error';
import type { PagedPostsResponse } from '../../../models/post';
import { PostService } from '../../../services/post';

type PostsForm = FormGroup<{
  pageIndex: FormControl<number>;
  pageSize: FormControl<number>;
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
        <p class="dashboard-posts__lead">Browse your generated posts with custom pagination.</p>
      </header>

      <form class="posts-controls" [formGroup]="form" (ngSubmit)="loadPosts()" novalidate>
        <div class="posts-controls__fields">
          <div class="field">
            <label class="field__label" for="pageIndex">Page index</label>
            <input
              id="pageIndex"
              class="field__input"
              type="number"
              formControlName="pageIndex"
              min="1"
              step="1"
              inputmode="numeric"
            />
          </div>
          <div class="field">
            <label class="field__label" for="pageSize">Page size</label>
            <input
              id="pageSize"
              class="field__input"
              type="number"
              formControlName="pageSize"
              min="1"
              max="100"
              step="1"
              inputmode="numeric"
            />
          </div>
        </div>
        <div class="posts-controls__actions">
          <button type="submit" class="btn btn--primary" [disabled]="isLoading() || form.invalid">
            {{ isLoading() ? 'Loading…' : 'Load posts' }}
          </button>
        </div>
      </form>

      @if (errorMessage()) {
        <p class="posts-status posts-status--error" role="alert">{{ errorMessage() }}</p>
      }

      @if (result(); as page) {
        <div class="posts-meta" aria-live="polite">
          <p>
            Showing page <strong>{{ page.pageIndex }}</strong> of
            <strong>{{ page.totalPages }}</strong>
            · {{ page.items.length }} item(s) on this page
          </p>
        </div>

        <div class="posts-pager">
          <button
            type="button"
            class="btn btn--secondary"
            [disabled]="isLoading() || !page.hasPreviousPage"
            (click)="goToPrevious(page)"
          >
            Previous
          </button>
          <button
            type="button"
            class="btn btn--secondary"
            [disabled]="isLoading() || !page.hasNextPage"
            (click)="goToNext(page)"
          >
            Next
          </button>
        </div>

        @if (page.items.length === 0) {
          <p class="posts-status">No posts on this page.</p>
        } @else {
          <ul class="posts-list">
            @for (post of page.items; track post.id) {
              <li class="post-card">
                <div class="post-card__head">
                  <h2 class="post-card__title">{{ post.title || 'Untitled' }}</h2>
                  <span class="post-card__status">{{ post.status }}</span>
                </div>
                @if (post.promptText) {
                  <p class="post-card__prompt"><span class="post-card__label">Prompt:</span> {{ post.promptText }}</p>
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
    </section>
  `,
})
export class DashboardPosts {
  private readonly postService = inject(PostService);

  protected readonly form: PostsForm = new FormGroup({
    pageIndex: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    pageSize: new FormControl(10, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
    }),
  });

  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly result = signal<PagedPostsResponse | null>(null);

  constructor() {
    this.loadPosts();
  }

  protected loadPosts(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { pageIndex, pageSize } = this.form.getRawValue();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.postService
      .getMyPosts(pageIndex, pageSize)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.form.patchValue({ pageIndex: response.pageIndex }, { emitEvent: false });
        },
        error: (error) => {
          this.result.set(null);
          this.errorMessage.set(toApplicationError(error, 'Could not load posts.').description);
        },
      });
  }

  protected goToPrevious(page: PagedPostsResponse): void {
    if (!page.hasPreviousPage) {
      return;
    }
    this.form.patchValue({ pageIndex: Math.max(1, page.pageIndex - 1) });
    this.loadPosts();
  }

  protected goToNext(page: PagedPostsResponse): void {
    if (!page.hasNextPage) {
      return;
    }
    this.form.patchValue({ pageIndex: page.pageIndex + 1 });
    this.loadPosts();
  }
}
