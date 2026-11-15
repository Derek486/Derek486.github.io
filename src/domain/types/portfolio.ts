import type { Experience } from "./experience";
import type { NavigationItem } from "./navigation-item";
import type { PlaygroundLayer } from "./playground-layer";
import type { Profile } from "./profile";
import type { Project } from "./project";
import type { SiteContent } from "./site-content";
import type { StackGroup } from "./stack-group";
import type { Technology } from "./technology";

export interface Portfolio {
  profile: Profile;
  content: SiteContent;
  navigation: NavigationItem[];
  projects: Project[];
  experiences: Experience[];
  technologies: Technology[];
  stack: StackGroup[];
  playground: PlaygroundLayer[];
}
