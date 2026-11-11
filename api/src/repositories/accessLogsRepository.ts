import { randomUUID, createHash } from 'node:crypto';
import { getContainer } from '../shared/cosmosClient.js';

export interface AccessLogDocument {
  id: string;
  yearMonth: string;
  postId: string;
  eventType: 'page_view' | 'read_more_click' | 'like' | 'share';
  timestamp: string;
  durationMs?: number;
  ipHash: string;
}

export interface AnalyticsSummary {
  yearMonth: string;
  topPosts: { postId: string; views: number }[];
  readMoreClicks: { postId: string; clicks: number }[];
  averageDurationMsByPost: { postId: string; averageDurationMs: number }[];
  uniqueVisitors: number;
}

export const accessLogsRepository = {
  async record(postId: string, eventType: AccessLogDocument['eventType'], ip: string, durationMs?: number): Promise<void> {
    const container = getContainer('accessLogs');
    const now = new Date();
    const doc: AccessLogDocument = {
      id: `log_${randomUUID().slice(0, 12)}`,
      yearMonth: now.toISOString().slice(0, 7),
      postId,
      eventType,
      timestamp: now.toISOString(),
      durationMs,
      ipHash: createHash('sha256').update(ip).digest('hex'),
    };
    await container.items.create(doc);
  },

  /** Aggregates accessLogs for a given month (default: current month) into dashboard-ready summaries. */
  async summary(yearMonth = new Date().toISOString().slice(0, 7)): Promise<AnalyticsSummary> {
    const container = getContainer('accessLogs');
    const { resources } = await container.items
      .query<AccessLogDocument>({
        query: 'SELECT * FROM c WHERE c.yearMonth = @yearMonth',
        parameters: [{ name: '@yearMonth', value: yearMonth }],
      })
      .fetchAll();

    const viewsByPost = new Map<string, number>();
    const clicksByPost = new Map<string, number>();
    const durationsByPost = new Map<string, number[]>();
    const uniqueIpHashes = new Set<string>();

    for (const log of resources) {
      uniqueIpHashes.add(log.ipHash);

      if (log.eventType === 'page_view') {
        viewsByPost.set(log.postId, (viewsByPost.get(log.postId) ?? 0) + 1);
        if (log.durationMs !== undefined) {
          const list = durationsByPost.get(log.postId) ?? [];
          list.push(log.durationMs);
          durationsByPost.set(log.postId, list);
        }
      }

      if (log.eventType === 'read_more_click') {
        clicksByPost.set(log.postId, (clicksByPost.get(log.postId) ?? 0) + 1);
      }
    }

    const topPosts = [...viewsByPost.entries()]
      .map(([postId, views]) => ({ postId, views }))
      .sort((a, b) => b.views - a.views);

    const readMoreClicks = [...clicksByPost.entries()]
      .map(([postId, clicks]) => ({ postId, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    const averageDurationMsByPost = [...durationsByPost.entries()].map(([postId, durations]) => ({
      postId,
      averageDurationMs: Math.round(durations.reduce((sum, d) => sum + d, 0) / durations.length),
    }));

    return { yearMonth, topPosts, readMoreClicks, averageDurationMsByPost, uniqueVisitors: uniqueIpHashes.size };
  },
};
