import { assetUrl } from "./asset-url";

export function projectUrl(id: string) {
  return assetUrl(`/proyectos/${id}/`);
}

export function projectAnchor(id: string) {
  return `proyecto-${id}`;
}
