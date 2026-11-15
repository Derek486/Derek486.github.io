import profile from "@/data/profile.json";
import content from "@/data/site.json";
import navigation from "@/data/navigation.json";
import projects from "@/data/projects.json";
import experiences from "@/data/experience.json";
import technologies from "@/data/technologies.json";
import stack from "@/data/stack.json";
import playground from "@/data/playground.json";
import type { PortfolioRepository } from "@/domain/ports/portfolio-repository";

export const jsonPortfolioRepository: PortfolioRepository = {
  getPortfolio: () => ({
    profile, content, navigation, projects, experiences, technologies, stack, playground,
  }),
};
