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

// 常用链接：静态整理的外部资源列表，可按需继续追加。
// Common links catalog: a static collection of external resources that can grow over time.
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
  {
    id: 'rustcc',
    boardId: commonLinksBoard.id,
    href: 'https://rustcc.cn/section?id=fed6b7de-0a74-48eb-8988-1978858c9b35',
    title: 'rustcc.cn',
    descriptionKey: 'commonLinks.rustcc.description',
    bestForTitleKey: 'commonLinks.rustcc.bestForTitle',
    bestForBodyKey: 'commonLinks.rustcc.bestForBody',
    featureKeyPrefixes: [
      'commonLinks.rustcc.featureCommunity',
      'commonLinks.rustcc.featureKnowledge',
      'commonLinks.rustcc.featureDiscussion',
    ],
    tagKeys: ['commonLinks.featured', 'commonLinks.external'],
    updatedAt: '2026-03-21T00:00:00.000Z',
  },
];

export const getCommonLinkById = (id: string) =>
  commonLinks.find((item) => item.id === id) ?? null;
