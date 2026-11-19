export interface SiteContent {
  title: string;
  description: string;
  projects: { eyebrow: string; title: string; description: string; secondaryTitle: string };
  stack: { eyebrow: string; title: string; description: string };
  experience: { eyebrow: string; title: string };
  about: { eyebrow: string; title: string };
  contact: { eyebrow: string; title: string; description: string; emailLabel: string };
}
