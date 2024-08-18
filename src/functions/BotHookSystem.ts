import { useEffect } from 'react'
import { isDev } from '@ir-engine/common/src/config'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { getState } from '@ir-engine/hyperflux'

import { BotHookFunctions } from './botHookFunctions'
import { sendXRInputData, simulateXR } from './xrBotHookFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { BotUserAgent } from '@ir-engine/common/src/constants/BotUserAgent'

const setupBotKey = 'ee.bot.setupBotKey'

const isBot = navigator.userAgent === BotUserAgent

const execute = () => {
  if (isBot && getState(XRState).session) {
    sendXRInputData()
  }
}

const reactor = () => {
  useEffect(() => {
    globalThis.botHooks = BotHookFunctions
    if (isDev) {
      // AvatarInputSchema.inputMap.set('Semicolon', setupBotKey)
      // AvatarInputSchema.behaviorMap.set(setupBotKey, (entity, inputKey, inputValue) => {
      //   if (inputValue.lifecycleState !== LifecycleValue.Started) return
      //   if (!EngineRenderer.instance.xrSession) simulateXR()
      // })
    }
    return () => {
      delete globalThis.botHooks

      // if (AvatarInputSchema.inputMap.get('Semicolon') === setupBotKey) AvatarInputSchema.inputMap.delete('Semicolon')
      // AvatarInputSchema.behaviorMap.delete('setupBotKey')
    }
  }, [])
  return null
}

export const BotHookSystem = defineSystem({
  uuid: 'ee.bot.BotHookSystem',
  insert: { with: SimulationSystemGroup },
  execute,
  reactor
})
