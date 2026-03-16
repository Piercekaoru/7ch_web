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
  href: string;
  repoHref?: string;
  title: string;
}

// 常用链接：目前先收录 cobalt.tools，后续可继续追加。
// Common links catalog: starts with cobalt.tools and can grow later.
export const commonLinks: CommonLinkItem[] = [
  {
    id: 'cobalt',
    href: 'https://cobalt.tools',
    repoHref: 'https://github.com/imputnet/cobalt',
    title: 'cobalt.tools',
  },
];
