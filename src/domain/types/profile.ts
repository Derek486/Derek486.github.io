import type { SocialLink } from "./social-link";

export interface Profile {
  name: string;
  shortName: string;
  role: string;
  availability: string;
  email: string;
  phone: string;
  resume: string;
  image: string;
  imageAlt: string;
  introduction: string;
  headline: string;
  headlineAccent: string;
  description: string;
  focus: string;
  about: string[];
  socials: SocialLink[];
}
