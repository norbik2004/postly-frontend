import { Component } from '@angular/core';

type FeatureCard = {
  title: string;
  body: string;
  mediaLabel: string;
  mediaHint: string;
};

const AI_BENEFITS = [
  'Generate engaging posts and captions in seconds',
  'Spark fresh marketing angles and content ideas',
  'Save hours on drafting while keeping your brand voice',
  'Strengthen social communication across every channel',
] as const;

const SUPPORTING_FEATURES: FeatureCard[] = [
  {
    title: 'Plan & schedule',
    body: 'Organize campaigns, queue posts, and publish on your timeline—without jumping between tools.',
    mediaLabel: 'Calendar view',
    mediaHint: 'Scheduling UI screenshot',
  },
  {
    title: 'Publish everywhere',
    body: 'Draft once and adapt for each network so your message stays consistent and on-brand.',
    mediaLabel: 'Channel preview',
    mediaHint: 'Multi-platform preview',
  },
  {
    title: 'Insights that matter',
    body: 'See what resonates, refine your strategy, and double down on content that drives engagement.',
    mediaLabel: 'Analytics',
    mediaHint: 'Performance dashboard',
  },
];

@Component({
  selector: 'app-features',
  styleUrl: './features.scss',
  template: `
    <section id="features" class="page-section features">
      <div class="section-inner">
        <header class="section-header">
          <p class="section-eyebrow">Platform</p>
          <h2 class="section-title">Everything you need to grow on social</h2>
          <p class="section-lead">
            Postly brings planning, AI-assisted writing, and publishing together—so your team ships
            better content faster.
          </p>
        </header>

        <article class="feature-spotlight" aria-labelledby="feature-ai-title">
          <div class="feature-spotlight__media">
            <figure class="media-frame media-frame--feature">
              <figcaption class="sr-only">AI writing assistant product preview</figcaption>
              <div class="media-slot" aria-hidden="true">
                <span class="media-slot__icon" aria-hidden="true">AI</span>
                <p class="media-slot__label">AI writing assistant</p>
                <p class="media-slot__hint">Product screenshot or demo video</p>
              </div>
            </figure>
          </div>

          <div class="feature-spotlight__content">
            <span class="feature-badge">AI-powered</span>
            <h3 id="feature-ai-title" class="feature-spotlight__title t-h3">
              Smart content that sounds like you
            </h3>
            <p class="feature-spotlight__lead t-body">
              Our AI model helps you create high-quality, engaging social posts—turning briefs into
              polished copy, hooks, and captions that fit your brand.
            </p>
            <ul class="benefit-list">
              @for (benefit of aiBenefits; track benefit) {
                <li class="benefit-list__item t-body-sm">{{ benefit }}</li>
              }
            </ul>
          </div>
        </article>

        <ul class="feature-grid">
          @for (item of supportingFeatures; track item.title) {
            <li class="feature-card">
              <figure class="media-frame media-frame--card">
                <figcaption class="sr-only">{{ item.mediaLabel }} preview</figcaption>
                <div class="media-slot media-slot--compact" aria-hidden="true">
                  <span class="media-slot__icon" aria-hidden="true">+</span>
                  <p class="media-slot__label">{{ item.mediaLabel }}</p>
                  <p class="media-slot__hint">{{ item.mediaHint }}</p>
                </div>
              </figure>
              <h3 class="feature-card__title t-h3">{{ item.title }}</h3>
              <p class="feature-card__body t-body-sm">{{ item.body }}</p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class Features {
  protected readonly aiBenefits = AI_BENEFITS;
  protected readonly supportingFeatures = SUPPORTING_FEATURES;
}
