/**
 * Template: How to add Realtime to any Clavio page
 * =================================================
 *
 * 1. Server Component page (most pages):
 *
 *    ```tsx
 *    import { RealtimeListener } from '@/components/providers/realtime-listener'
 *
 *    export default async function MyPage() {
 *      // ... server data fetch ...
 *      return (
 *        <div>
 *          <RealtimeListener tables={['my_table']} channelName="my-page" />
 *          {/* ... rest of page ... *\/}
 *        </div>
 *      )
 *    }
 *    ```
 *
 * 2. Client Component page:
 *
 *    ```tsx
 *    'use client'
 *    import { useRealtime } from '@/components/providers/realtime-listener'
 *
 *    export default function MyPage() {
 *      useRealtime({ tables: ['my_table'], channelName: 'my-page' })
 *      return <div>...</div>
 *    }
 *    ```
 *
 * 3. Show connection status:
 *
 *    ```tsx
 *    import { RealtimeStatus } from '@/components/providers/realtime-listener'
 *    <RealtimeStatus channelName="my-page" label="Live" />
 *    ```
 *
 * Table reference:
 *   'ideas' | 'videos' | 'posts' | 'workflow_runs' | 'logs' | 'post_metrics' | 'assets'
 */

export {}
