import { Board } from '../types';

// 静态栏目：只在前端展示，不依赖后端板块表。
// Static board: frontend-only and not backed by thread APIs.
export const commonLinksBoard: Board = {
  id: 'links',
  name: 'board.links.name',
  description: 'board.links.desc',
};

export interface CommonLinkItem {
  id: string;
  boardId: string;
  href: string;
  repoHref?: string;
  title: string;
  descriptionKey: string;
  bestForTitleKey: string;
  bestForBodyKey: string;
  featureKeyPrefixes: string[];
  tagKeys: string[];
  updatedAt: string;
}

// 常用链接：目前先收录 cobalt.tools，后续可继续追加。
// Common links catalog: starts with cobalt.tools and can grow later.
export const commonLinks: CommonLinkItem[] = [
  {
    id: 'cobalt',
    boardId: commonLinksBoard.id,
    href: 'https://cobalt.tools',
    repoHref: 'https://github.com/imputnet/cobalt',
    title: 'cobalt.tools',
    descriptionKey: 'commonLinks.cobalt.description',
    bestForTitleKey: 'commonLinks.cobalt.bestForTitle',
    bestForBodyKey: 'commonLinks.cobalt.bestForBody',
    featureKeyPrefixes: [
      'commonLinks.cobalt.featurePaste',
      'commonLinks.cobalt.featureClean',
      'commonLinks.cobalt.featurePrivacy',
    ],
    tagKeys: ['commonLinks.featured', 'commonLinks.external'],
    updatedAt: '2026-03-16T00:00:00.000Z',
  },
];

export const getCommonLinkById = (id: string) =>
  commonLinks.find((item) => item.id === id) ?? null;
