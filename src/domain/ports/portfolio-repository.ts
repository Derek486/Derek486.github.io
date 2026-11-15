import type { Portfolio } from "../types/portfolio";

export interface PortfolioRepository {
  getPortfolio(): Portfolio;
}
