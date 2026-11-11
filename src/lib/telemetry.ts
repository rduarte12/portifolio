/** Fire-and-forget telemetry beacon; never blocks navigation or throws on failure. */
function sendTelemetryEvent(payload: { postId: string; eventType: 'page_view' | 'read_more_click'; durationMs?: number }) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/telemetry', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    }
  } catch {
    // Telemetry must never break the user-facing experience.
  }
}

export function trackReadMoreClick(postId: string) {
  sendTelemetryEvent({ postId, eventType: 'read_more_click' });
}

export function trackPageView(postId: string, durationMs?: number) {
  sendTelemetryEvent({ postId, eventType: 'page_view', durationMs });
}
