import { describe, expect, it } from 'vitest';
import { buildPageTree } from '../../../src/modules/pages/page-tree.js';

type Row = {
  id: string;
  parentPageId: string | null;
  createdAt: Date;
  title: string;
};

describe('buildPageTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildPageTree([])).toEqual([]);
  });

  it('builds single root', () => {
    const pages: Row[] = [
      { id: 'a', parentPageId: null, createdAt: new Date('2020-01-01'), title: 'A' },
    ];
    const tree = buildPageTree(pages);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('a');
    expect(tree[0].children).toEqual([]);
  });

  it('nests children under parent', () => {
    const pages: Row[] = [
      { id: 'p', parentPageId: null, createdAt: new Date('2020-01-01'), title: 'P' },
      { id: 'c', parentPageId: 'p', createdAt: new Date('2020-01-02'), title: 'C' },
    ];
    const tree = buildPageTree(pages);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('p');
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].id).toBe('c');
  });

  it('sorts siblings by createdAt', () => {
    const pages: Row[] = [
      { id: 'p', parentPageId: null, createdAt: new Date('2020-01-01'), title: 'P' },
      { id: 'b', parentPageId: 'p', createdAt: new Date('2020-01-03'), title: 'B' },
      { id: 'a', parentPageId: 'p', createdAt: new Date('2020-01-02'), title: 'A' },
    ];
    const tree = buildPageTree(pages);
    expect(tree[0].children.map((c) => c.id)).toEqual(['a', 'b']);
  });

  it('treats missing parent id as root', () => {
    const pages: Row[] = [
      { id: 'o99', parentPageId: 'missing', createdAt: new Date('2020-01-01'), title: 'O' },
    ];
    const tree = buildPageTree(pages);
    expect(tree).toHaveLength(1);
    expect(tree[0].id).toBe('o99');
  });

  it('supports multiple roots', () => {
    const pages: Row[] = [
      { id: 'r1', parentPageId: null, createdAt: new Date('2020-01-01'), title: 'R1' },
      { id: 'r2', parentPageId: null, createdAt: new Date('2020-01-02'), title: 'R2' },
    ];
    const tree = buildPageTree(pages);
    expect(tree.map((n) => n.id)).toEqual(['r1', 'r2']);
  });
});
