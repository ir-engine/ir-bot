import type { ProjectConfigInterface } from '@ir-engine/projects/ProjectConfigInterface'

const config: ProjectConfigInterface = {
  onEvent: undefined,
  thumbnail: '/static/ir-engine_thumbnail.jpg',
  routes: {},
  worldInjection: () => import('./injectBotModule'),
  services: undefined,
  databaseSeed: undefined
}

export default config
