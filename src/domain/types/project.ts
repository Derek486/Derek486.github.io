export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  github: string;
  image: string;
  imageAlt: string;
  link?: string;
  technologies: string[];
  primary?: boolean;
  featured?: boolean;
  highlights?: string[];
  preserveImage?: boolean;
  imageWidth?: number;
  imageHeight?: number;
}
