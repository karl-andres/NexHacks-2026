import { RealtimeVision } from '@overshoot/sdk'
import { env } from '@/lib/env'

export const vision = new RealtimeVision({
  apiUrl: 'https://cluster1.overshoot.ai/api/v0.2',
  apiKey: env.OVERSHOOT_API_KEY,
  prompt: 'Desribe the in the user\'s hand',
  source: { type: 'camera', cameraFacing: 'user'},
  processing: {
    clip_length_seconds: 1,
    delay_seconds: 1,
    fps: 30,
    sampling_ratio: 0.1
  },
  // outputSchema: {
  //   type: 'object',
  //   properties: {
  //     count: { type: 'number' }
  //   }
  // },
  onResult: (result) => {
    console.log(result.result)
  }
})

