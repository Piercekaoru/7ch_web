import { commonLinksBoard } from '../data/commonLinks';
import type { Board } from '../types';

export const hiddenBoardIds = new Set(['baito']);
export const seoHiddenBoardIds = new Set(['baito']);

export const isBoardVisible = (boardId: string) => !hiddenBoardIds.has(boardId);
export const isBoardIndexable = (boardId: string) =>
  boardId !== 'all' && boardId !== commonLinksBoard.id && !seoHiddenBoardIds.has(boardId);

export const visibleContentBoardIds = ['news', 'g', 'acg', 'vip'] as const;

export const fallbackBoards: Board[] = [
  { id: 'all', name: 'board.all.name', description: 'board.all.desc' },
  { id: 'news', name: 'board.news.name', description: 'board.news.desc' },
  { id: 'g', name: 'board.g.name', description: 'board.g.desc' },
  { id: 'acg', name: 'board.acg.name', description: 'board.acg.desc' },
  { id: 'vip', name: 'board.vip.name', description: 'board.vip.desc' },
];

export const mergeBoardsWithStatic = (boards: Board[]) => {
  const seen = new Set<string>();
  const allBoard = fallbackBoards.find((board) => board.id === 'all');

  return [
    ...(allBoard ? [allBoard] : []),
    ...boards.filter((board) => isBoardVisible(board.id)),
    commonLinksBoard,
  ].filter((board) => {
    if (seen.has(board.id)) return false;
    seen.add(board.id);
    return true;
  });
};
