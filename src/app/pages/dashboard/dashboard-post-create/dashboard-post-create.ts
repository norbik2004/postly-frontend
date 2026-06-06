import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { toApplicationError } from '../../../models/application-error';
import {
  normalizePostTitle,
  parseHashtagSegments,
  POST_BODY_MAX_LENGTH,
  POST_TITLE_MAX_LENGTH,
} from '../../../models/post';
import { PostService } from '../../../services/post';
import {
  DEFAULT_POSTS_LIST_QUERY,
  postsListQueryToParams,
  readPostsListQueryFromHistory,
} from '../dashboard-posts/posts-list-query';
import { POST_BODY_EMOJIS } from '../shared/post-body-emojis';

type CreatePostForm = FormGroup<{
  title: FormControl<string>;
  body: FormControl<string>;
}>;

@Component({
  selector: 'app-dashboard-post-create',
  imports: [RouterLink, ReactiveFormsModule, MatTooltip, MatButtonModule, NgTemplateOutlet],
  styleUrl: '../dashboard-post-detail/dashboard-post-detail.scss',
  template: `
    <section class="dashboard-content-page post-detail" aria-labelledby="post-create-title">
      <header class="post-detail__header">
        <div class="post-detail__top">
          <div class="post-detail__nav">
            <a
              [routerLink]="['/dashboard/posts']"
              [queryParams]="postsReturnQueryParams()"
              class="section-eyebrow post-detail__eyebrow"
            >
              ← Back to posts
            </a>
          </div>
        </div>

        <h1 id="post-create-title" class="post-detail__title post-detail__title--static">New post</h1>
      </header>

      @if (errorMessage()) {
        <p class="posts-status posts-status--error" role="alert">{{ errorMessage() }}</p>
      }

      <form class="post-detail__sections" [formGroup]="form" (ngSubmit)="submit()">
        <section class="post-detail__content" aria-labelledby="post-create-title-label">
          <p id="post-create-title-label" class="section-eyebrow post-detail__content-label">Title</p>
          <div class="post-detail__edit-panel post-detail__three-quarters">
            <textarea
              #titleInput
              id="create-post-title"
              class="field__input field__input--title"
              formControlName="title"
              rows="2"
              maxlength="{{ titleMaxLength }}"
              autocomplete="off"
              aria-describedby="create-post-title-hint create-post-title-error"
              (input)="onTitleInput()"
            ></textarea>
            <div class="post-detail__edit-foot">
              <p id="create-post-title-hint" class="post-detail__hint">
                {{ form.controls.title.value.length }}/{{ titleMaxLength }}
              </p>
              @if (form.controls.title.touched && form.controls.title.hasError('required')) {
                <p id="create-post-title-error" class="field__error" role="alert">Title is required.</p>
              }
              @if (form.controls.title.touched && form.controls.title.hasError('maxlength')) {
                <p id="create-post-title-error" class="field__error" role="alert">
                  Title cannot exceed {{ titleMaxLength }} characters.
                </p>
              }
            </div>
          </div>
        </section>

        <section class="post-detail__content" aria-labelledby="post-create-body-label">
          <p id="post-create-body-label" class="section-eyebrow post-detail__content-label">Content</p>
          <div class="post-detail__edit-panel post-detail__half">
            <div class="post-detail__body-editor">
              <div
                #bodyHighlight
                class="post-detail__body-highlight field__input field__input--body"
                aria-hidden="true"
              >
                <ng-container
                  *ngTemplateOutlet="hashtagText; context: { text: form.controls.body.value, wrapPlain: true }"
                />
              </div>
              <textarea
                #bodyInput
                id="create-post-body"
                class="field__input field__input--body field__input--body-overlay"
                formControlName="body"
                rows="1"
                maxlength="{{ bodyMaxLength }}"
                autocomplete="off"
                aria-describedby="create-post-body-hint create-post-body-error"
                (input)="onBodyInput()"
                (scroll)="syncBodyHighlightScroll()"
              ></textarea>
            </div>
            <div class="post-detail__edit-foot">
              <div class="post-detail__edit-meta">
                <p id="create-post-body-hint" class="post-detail__hint">
                  {{ form.controls.body.value.length }}/{{ bodyMaxLength }}
                </p>
                <div class="post-detail__emoji-anchor" #emojiAnchor>
                  <button
                    mat-icon-button
                    type="button"
                    class="post-detail__emoji-trigger"
                    [class.post-detail__emoji-trigger--open]="emojiPickerOpen()"
                    matTooltip="Insert emoji"
                    aria-label="Insert emoji"
                    [attr.aria-expanded]="emojiPickerOpen()"
                    aria-controls="create-post-emoji-picker"
                    (click)="toggleEmojiPicker($event)"
                  >
                    <span class="material-icons" aria-hidden="true">sentiment_satisfied_alt</span>
                  </button>
                  @if (emojiPickerOpen()) {
                    <div
                      id="create-post-emoji-picker"
                      class="emoji-picker"
                      role="group"
                      aria-label="Emoji picker"
                    >
                      @for (emoji of contentEmojis; track emoji) {
                        <button
                          type="button"
                          class="emoji-picker__option"
                          [attr.aria-label]="'Insert ' + emoji"
                          (click)="insertBodyEmoji(emoji)"
                        >
                          {{ emoji }}
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
              @if (form.controls.body.touched && form.controls.body.hasError('required')) {
                <p id="create-post-body-error" class="field__error" role="alert">Content is required.</p>
              }
              @if (form.controls.body.touched && form.controls.body.hasError('maxlength')) {
                <p id="create-post-body-error" class="field__error" role="alert">
                  Content cannot exceed {{ bodyMaxLength }} characters.
                </p>
              }
              <div class="post-detail__inline-actions">
                <button type="submit" class="btn btn--primary btn--compact" [disabled]="isCreating() || form.invalid">
                  {{ isCreating() ? 'Creating…' : 'Create post' }}
                </button>
                <button
                  type="button"
                  class="btn btn--secondary btn--compact"
                  [disabled]="isCreating()"
                  (click)="cancel()"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </section>
      </form>
    </section>

    <ng-template #hashtagText let-text="text" let-wrapPlain="wrapPlain">
      @for (segment of hashtagSegments(text); track $index) {
        @if (segment.highlighted) {
          <span class="hashtag">{{ segment.text }}</span>
        } @else if (wrapPlain) {
          <span>{{ segment.text }}</span>
        } @else {
          {{ segment.text }}
        }
      }
    </ng-template>
  `,
})
export class DashboardPostCreate implements AfterViewInit {
  private readonly postService = inject(PostService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly titleInput = viewChild<ElementRef<HTMLTextAreaElement>>('titleInput');
  private readonly bodyInput = viewChild<ElementRef<HTMLTextAreaElement>>('bodyInput');
  private readonly bodyHighlight = viewChild<ElementRef<HTMLDivElement>>('bodyHighlight');
  private readonly emojiAnchor = viewChild<ElementRef<HTMLElement>>('emojiAnchor');
  private bodyInputObserver: ResizeObserver | undefined;

  protected readonly titleMaxLength = POST_TITLE_MAX_LENGTH;
  protected readonly bodyMaxLength = POST_BODY_MAX_LENGTH;
  protected readonly contentEmojis = POST_BODY_EMOJIS;
  protected readonly hashtagSegments = parseHashtagSegments;
  protected readonly postsReturnQueryParams = signal(
    postsListQueryToParams(readPostsListQueryFromHistory() ?? DEFAULT_POSTS_LIST_QUERY)
  );

  protected readonly form: CreatePostForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(POST_TITLE_MAX_LENGTH)],
    }),
    body: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(POST_BODY_MAX_LENGTH)],
    }),
  });

  protected readonly isCreating = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly emojiPickerOpen = signal(false);

  constructor() {
    this.destroyRef.onDestroy(() => this.disconnectBodyInputObserver());
  }

  ngAfterViewInit(): void {
    this.observeBodyInput();
    queueMicrotask(() => {
      this.titleInput()?.nativeElement?.focus();
      this.resizeBodyInput();
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.emojiPickerOpen()) {
      this.emojiPickerOpen.set(false);
      return;
    }

    if (!this.isCreating()) {
      this.cancel();
    }
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.emojiPickerOpen()) {
      return;
    }

    const target = event.target as Node;
    const anchor = this.emojiAnchor()?.nativeElement;
    const bodyInput = this.bodyInput()?.nativeElement;

    if (anchor?.contains(target) || bodyInput?.contains(target)) {
      return;
    }

    this.emojiPickerOpen.set(false);
  }

  protected onTitleInput(): void {
    this.applyClampedInput(this.form.controls.title, this.clampTitle.bind(this), this.titleInput()?.nativeElement);
  }

  protected onBodyInput(): void {
    this.applyClampedInput(this.form.controls.body, this.clampBody.bind(this), this.bodyInput()?.nativeElement);
    this.resizeBodyInput();
  }

  protected insertBodyEmoji(emoji: string): void {
    const control = this.form.controls.body;
    const textarea = this.bodyInput()?.nativeElement;
    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? control.value.length;
    const end = textarea.selectionEnd ?? start;
    const next = this.clampBody(`${control.value.slice(0, start)}${emoji}${control.value.slice(end)}`);

    if (next === control.value) {
      return;
    }

    const nextCursor = Math.min(start + emoji.length, next.length);
    control.setValue(next, { emitEvent: false });
    control.markAsDirty();

    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
      this.resizeBodyInput();
    });
  }

  protected toggleEmojiPicker(event: Event): void {
    event.stopPropagation();
    this.emojiPickerOpen.update((open) => !open);
  }

  protected syncBodyHighlightScroll(): void {
    const textarea = this.bodyInput()?.nativeElement;
    const highlight = this.bodyHighlight()?.nativeElement;
    if (!textarea || !highlight) {
      return;
    }

    highlight.scrollTop = textarea.scrollTop;
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const title = this.clampTitle(this.form.controls.title.value.trim());
    const body = this.clampBody(this.form.controls.body.value.trim());

    this.isCreating.set(true);
    this.errorMessage.set(null);
    this.emojiPickerOpen.set(false);

    this.postService
      .createPost({ title, body })
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: (created) => {
          void this.router.navigate(['/dashboard/posts', created.id]);
        },
        error: (error) => {
          this.errorMessage.set(toApplicationError(error, 'Could not create post.').description);
        },
      });
  }

  protected cancel(): void {
    void this.router.navigate(['/dashboard/posts'], {
      queryParams: this.postsReturnQueryParams(),
    });
  }

  private observeBodyInput(): void {
    const textarea = this.bodyInput()?.nativeElement;
    if (!textarea) {
      return;
    }

    this.disconnectBodyInputObserver();
    this.bodyInputObserver = new ResizeObserver(() => this.resizeBodyInput());
    this.bodyInputObserver.observe(textarea);
  }

  private disconnectBodyInputObserver(): void {
    this.bodyInputObserver?.disconnect();
    this.bodyInputObserver = undefined;
  }

  private resizeBodyInput(): void {
    const textarea = this.bodyInput()?.nativeElement;
    const highlight = this.bodyHighlight()?.nativeElement;
    if (!textarea) {
      return;
    }

    const styles = getComputedStyle(textarea);
    const lineHeight =
      Number.parseFloat(styles.lineHeight) || Number.parseFloat(styles.fontSize) * 1.65 || 20;
    const paddingTop = Number.parseFloat(styles.paddingTop);
    const paddingBottom = Number.parseFloat(styles.paddingBottom);
    const borderTop = Number.parseFloat(styles.borderTopWidth);
    const borderBottom = Number.parseFloat(styles.borderBottomWidth);
    const verticalChrome = paddingTop + paddingBottom + borderTop + borderBottom;
    const extraLine = Number.isFinite(lineHeight) ? lineHeight : 0;

    textarea.style.height = '0';
    const wrappedContentHeight = textarea.scrollHeight - verticalChrome;
    const wrappedLines = Math.max(1, Math.ceil(wrappedContentHeight / extraLine));
    const nextHeight = `${wrappedLines * extraLine + verticalChrome + extraLine}px`;
    textarea.style.height = nextHeight;

    if (highlight) {
      highlight.style.height = nextHeight;
      highlight.scrollTop = textarea.scrollTop;
    }
  }

  private applyClampedInput(
    control: FormControl<string>,
    clamp: (value: string) => string,
    textarea?: HTMLTextAreaElement
  ): void {
    const next = clamp(control.value);
    if (next === control.value) {
      return;
    }

    const cursor = textarea?.selectionStart ?? next.length;
    control.setValue(next, { emitEvent: false });

    queueMicrotask(() => {
      if (!textarea) {
        return;
      }

      textarea.setSelectionRange(Math.min(cursor, next.length), Math.min(cursor, next.length));
    });
  }

  private clampTitle(value: string): string {
    return normalizePostTitle(value).slice(0, POST_TITLE_MAX_LENGTH);
  }

  private clampBody(value: string): string {
    return value.slice(0, POST_BODY_MAX_LENGTH);
  }
}
