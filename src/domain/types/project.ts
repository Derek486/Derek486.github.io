export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  github: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
  caseStudy: {
    problem: string;
    caption: string;
    architecture: { name: string; summary: string }[];
    features: string[];
    lessons: string[];
    note?: string;
  };
  link?: string;
  technologies: string[];
  keyTechnologies?: string[];
  primary?: boolean;
  highlights?: string[];
}
