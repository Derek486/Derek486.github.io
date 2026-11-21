import type { PortfolioRepository } from "@/domain/ports/portfolio-repository";

export function getPortfolio(repository: PortfolioRepository) {
  const portfolio = repository.getPortfolio();
  const ids = new Set(portfolio.technologies.map(({ id }) => id));
  const groups = [
    portfolio.projects, portfolio.experiences, portfolio.stack, portfolio.playground,
  ];

  for (const group of groups) {
    for (const item of group) {
      for (const id of item.technologies) {
        if (!ids.has(id)) {
          throw new Error(`Tecnología desconocida "${id}" en "${item.id}". Revisa src/data/.`);
        }
      }

      for (const id of item.keyTechnologies ?? []) {
        if (!item.technologies.includes(id)) {
          throw new Error(`La tecnología destacada "${id}" debe estar en "${item.id}". Revisa src/data/.`);
        }
      }
    }
  }

  if (!portfolio.playground.length) {
    throw new Error("src/data/playground.json necesita al menos una capa.");
  }

  const experienceIds = new Set(portfolio.experiences.map(({ id }) => id));
  for (const layer of portfolio.playground) {
    if (!experienceIds.has(layer.experienceId)) {
      throw new Error(`Experiencia desconocida "${layer.experienceId}" en "${layer.id}". Revisa src/data/.`);
    }
  }

  return portfolio;
}
