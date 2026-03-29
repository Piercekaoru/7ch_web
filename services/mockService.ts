import {
  I7chAPI,
  Board,
  Thread,
  Post,
  ThreadDetail,
  CreateThreadRequest,
  CreatePostRequest,
  CreateSubscriptionLinkRequest,
  CreateSubscriptionLinkResponse,
  PaginatedThreads,
  SubscriptionConvertRequest,
  SubscriptionConvertResponse,
} from '../types';
import { assertPublicSubscriptionSourceUrl, maskSubscriptionUrlForDisplay } from '../lib/subscriptionUrl';

// 本地 Mock：使用 LocalStorage 模拟后端 API 行为，便于无后端开发/演示。
// Local mock: uses LocalStorage to emulate backend API for offline dev/demo.
const STORAGE_KEY = '7ch_db_v1';
const DEVICE_ID_KEY = '7ch_device_uuid';

// 简易哈希：用于 Tripcode 与每日 ID 的本地模拟（非加密用途）。
// Simple hash: local-only mock for tripcode/daily ID (not cryptographic).
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8).toUpperCase();
};

// 设备标识：用来稳定生成“每日 ID”（仅本地）。
// Device id: stable seed for mock daily ID (local only).
const getDeviceId = (): string => {
  let uuid = localStorage.getItem(DEVICE_ID_KEY);
  if (!uuid) {
    uuid = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, uuid);
  }
  return uuid;
};

// 每日 ID：基于设备 + 日期 + 板块生成，模仿后端逻辑。
// Daily ID: derived from device + date + board, mirrors backend behavior.
const generateDailyId = (boardId: string): string => {
  const dateStr = new Date().toISOString().split('T')[0];
  const deviceId = getDeviceId();
  return simpleHash(`${deviceId}-${dateStr}-${boardId}`).substring(0, 9);
};

// 初始板块数据：使用 i18n key，保持多语言一致。
// Initial boards: use i18n keys to keep translations consistent.
const INITIAL_BOARDS: Board[] = [
  { id: 'all', name: 'board.all.name', description: 'board.all.desc' },
  { id: 'news', name: 'board.news.name', description: 'board.news.desc' },
  { id: 'g', name: 'board.g.name', description: 'board.g.desc' },
  { id: 'acg', name: 'board.acg.name', description: 'board.acg.desc' },
  { id: 'vip', name: 'board.vip.name', description: 'board.vip.desc' },
];

interface DBSchema {
  threads: Thread[];
  posts: Record<string, Post[]>; // threadId -> posts
}

export class MockService implements I7chAPI {
  private db: DBSchema;

  constructor() {
    // 优先读取已保存的数据；没有则初始化并写入种子数据。
    // Prefer persisted data; otherwise initialize and seed.
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.db = JSON.parse(saved);
    } else {
      this.db = { threads: [], posts: {} };
      this.seedData();
    }
  }

  private save() {
    // 将当前内存状态持久化到 LocalStorage。
    // Persist in-memory state to LocalStorage.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  private seedData() {
    // 初始化欢迎线程，帮助新用户理解功能。
    // Seed a welcome thread to showcase features.
    // Create a welcome thread
    const threadId = 'welcome-thread-' + Date.now();
    const now = new Date().toISOString();

    const opPost: Post = {
      id: 1,
      threadId,
      name: 'Admin',
      tripcode: '★ADMIN',
      content: 'Welcome to 7ch!\n\nThis is a demo of the new UI.\nFeatures:\n1. Tripcodes: Name#pass\n2. Anchors: >>1\n3. Sage: put "sage" in email',
      createdAt: now,
      uid: 'ADMIN',
      isOp: true
    };

    const thread: Thread = {
      id: threadId,
      boardId: 'news',
      title: '【Official】Welcome to 7ch - The Modern Anonymous BBS ★1',
      postCount: 1,
      viewCount: 1,
      createdAt: now,
      updatedAt: now,
      opPost
    };

    this.db.threads.push(thread);
    this.db.posts[threadId] = [opPost];
    this.save();
  }

  private async delay(ms: number = 200) {
    // 模拟真实网络延迟，便于前端加载态测试。
    // Simulate network latency for loading-state testing.
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // --- API Implementation ---

  async getBoards(): Promise<Board[]> {
    await this.delay();
    return INITIAL_BOARDS;
  }

  async getThreads(boardId: string, page: number = 1): Promise<PaginatedThreads> {
    await this.delay();
    let threads = this.db.threads;

    // 按板块过滤；'all' 代表不筛选。
    // Filter by board; 'all' means no filtering.
    // If boardId is NOT 'all', filter by board. If 'all', return everything.
    if (boardId !== 'all') {
      threads = threads.filter(t => t.boardId === boardId);
    }

    // 按更新时间倒序，模拟“被顶上来”的排序体验。
    // Sort by updated time desc to mimic bump behavior.
    const sorted = threads.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Pagination
    const pageSize = 50;
    const total = sorted.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedThreads = sorted.slice(start, end);

    return {
      threads: paginatedThreads,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  async getThreadContent(threadId: string, afterPostId?: number): Promise<ThreadDetail> {
    await this.delay();
    const thread = this.db.threads.find(t => t.id === threadId);
    if (!thread) throw new Error('Thread not found');

    // 浏览量：模拟真实后端的“查看即 +1”逻辑。
    // View count: increment on read to mirror backend.
    // Real View Count Logic: Increment when actually viewed
    thread.viewCount = (thread.viewCount || 0) + 1;
    this.save();

    const posts = this.db.posts[threadId] || [];
    return { ...thread, posts };
  }

  async createThread(payload: CreateThreadRequest): Promise<string> {
    await this.delay();
    const threadId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 名称与 Tripcode 处理：Name#pass => Name + ◆hash。
    // Name and tripcode handling: Name#pass => Name + ◆hash.
    // Logic: Process Name & Tripcode
    let displayName = payload.name || 'Anonymous';
    let tripcode = undefined;

    if (displayName.includes('#')) {
      const [namePart, passPart] = displayName.split('#');
      displayName = namePart || 'Anonymous';
      if (passPart) {
        tripcode = '◆' + simpleHash(passPart);
      }
    }

    const post: Post = {
      id: 1,
      threadId,
      name: displayName,
      tripcode,
      content: payload.content,
      createdAt: now,
      uid: generateDailyId(payload.boardId),
      isOp: true
    };

    const thread: Thread = {
      id: threadId,
      boardId: payload.boardId,
      title: payload.title,
      postCount: 1,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      opPost: post
    };

    this.db.threads.push(thread);
    this.db.posts[threadId] = [post];
    this.save();
    return threadId;
  }

  async createPost(payload: CreatePostRequest): Promise<Post> {
    await this.delay();
    const thread = this.db.threads.find(t => t.id === payload.threadId);
    if (!thread) throw new Error('Thread not found');

    const now = new Date().toISOString();
    const posts = this.db.posts[payload.threadId];
    const newPostId = posts.length + 1;

    // 名称与 Tripcode 处理（与发帖保持一致）。
    // Name and tripcode handling (same as thread creation).
    let displayName = payload.name || 'Anonymous';
    let tripcode = undefined;

    if (displayName.includes('#')) {
      const [namePart, passPart] = displayName.split('#');
      displayName = namePart || 'Anonymous';
      if (passPart) {
        tripcode = '◆' + simpleHash(passPart);
      }
    }

    // Sage：若 email 含 sage，则不顶帖。
    // Sage: if email contains "sage", do not bump.
    const isSage = payload.email?.toLowerCase().includes('sage');

    const post: Post = {
      id: newPostId,
      threadId: payload.threadId,
      name: displayName,
      tripcode,
      content: payload.content,
      createdAt: now,
      uid: generateDailyId(thread.boardId),
      isOp: false
    };

    // 写入回复并更新统计。
    // Write reply and update counts.
    posts.push(post);
    thread.postCount = posts.length;
    // Removed fake random view counting

    // 仅非 sage 才更新时间（决定列表排序）。
    // Update bump time only when not sage.
    if (!isSage) {
      thread.updatedAt = now;
    }

    this.save();
    return post;
  }

  async convertSubscription(payload: SubscriptionConvertRequest): Promise<SubscriptionConvertResponse> {
    await this.delay(350);

    if (payload.sourceFormat !== 'clash' || payload.targetFormat !== 'sing-box') {
      throw new Error('currently only clash -> sing-box is supported');
    }

    assertPublicSubscriptionSourceUrl(payload.sourceUrl);

    const now = Date.now();
    const content = JSON.stringify({
      log: { level: 'warn' },
      outbounds: [
        {
          type: 'selector',
          tag: 'proxy',
          outbounds: ['mock-node']
        },
        {
          type: 'vmess',
          tag: 'mock-node',
          server: 'example.com',
          server_port: 443,
          uuid: '00000000-0000-0000-0000-000000000000'
        },
        {
          type: 'direct',
          tag: 'direct'
        }
      ],
      route: {
        final: 'proxy'
      }
    }, null, 2);

    return {
      content,
      warnings: ['Mock mode: this converted result is generated locally for UI testing.'],
      meta: {
        sourceFormat: 'clash',
        targetFormat: 'sing-box',
        elapsedMs: 320 + (now % 150),
        contentBytes: new TextEncoder().encode(content).length,
        nodeCount: 1
      }
    };
  }

  async createSubscriptionLink(payload: CreateSubscriptionLinkRequest): Promise<CreateSubscriptionLinkResponse> {
    await this.delay(120);
    const sourceUrl = assertPublicSubscriptionSourceUrl(payload.sourceUrl);
    const expiresIn = payload.expiresInSeconds ?? 0;
    const expiresAt = expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : undefined;
    const fakeToken = btoa(JSON.stringify({
      src: sourceUrl,
      sf: payload.sourceFormat,
      tf: payload.targetFormat,
      iat: Date.now()
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const url = `${window.location.origin}/api/sub?token=${fakeToken}`;
    return {
      token: fakeToken,
      url,
      displayUrl: maskSubscriptionUrlForDisplay(url),
      expiresAt
    };
  }
}

export const mockApi = new MockService();
