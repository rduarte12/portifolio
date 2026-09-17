import { z } from 'zod';

export const telemetryEventSchema = z.object({
  postId: z.string().min(1),
  eventType: z.enum(['page_view', 'read_more_click']),
  durationMs: z.number().nonnegative().optional(),
});

export type TelemetryEventInput = z.infer<typeof telemetryEventSchema>;
