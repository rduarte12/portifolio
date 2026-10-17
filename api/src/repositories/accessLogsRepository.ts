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
};
