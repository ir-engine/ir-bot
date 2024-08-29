import { mockEngineRenderer } from '@ir-engine/spatial/tests/util/MockEngineRenderer'
import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import { initializeSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { requestXRSession } from '@ir-engine/spatial/src/xr/XRSessionFunctions'
import { describe, it, beforeEach, afterEach, assert, beforeAll } from 'vitest'
import { WebXREventDispatcher } from '../webxr-emulator/WebXREventDispatcher'
import { POLYFILL_ACTIONS } from '../webxr-emulator/actions'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { ECSState, Timer, setComponent } from '@ir-engine/ecs'

const deviceDefinition = {
  id: 'Oculus Quest',
  name: 'Oculus Quest',
  modes: ['inline', 'immersive-vr'],
  headset: {
    hasPosition: true,
    hasRotation: true
  },
  controllers: [
    {
      id: 'Oculus Touch (Right)',
      buttonNum: 7,
      primaryButtonIndex: 0,
      primarySqueezeButtonIndex: 1,
      hasPosition: true,
      hasRotation: true,
      hasSqueezeButton: true,
      isComplex: true
    },
    {
      id: 'Oculus Touch (Left)',
      buttonNum: 7,
      primaryButtonIndex: 0,
      primarySqueezeButtonIndex: 1,
      hasPosition: true,
      hasRotation: true,
      hasSqueezeButton: true,
      isComplex: true
    }
  ]
}

/** @todo fix */
describe.skip('WebXR', () => {
  beforeAll(async () => {
    const { CustomWebXRPolyfill } = await import('../webxr-emulator/CustomWebXRPolyfill')
    new CustomWebXRPolyfill()
  })

  beforeEach(async () => {
    createEngine()
    initializeSpatialEngine()

    const timer = Timer((time, xrFrame) => {
      getMutableState(XRState).xrFrame.set(xrFrame)
      // executeSystems(time)
      getMutableState(XRState).xrFrame.set(null)
    })
    getMutableState(ECSState).timer.set(timer)

    const { originEntity, localFloorEntity, viewerEntity } = getState(EngineState)
    mockEngineRenderer(viewerEntity)
    setComponent(viewerEntity, RendererComponent, { scenes: [originEntity, localFloorEntity, viewerEntity] })
  })

  afterEach(async () => {
    await destroyEngine()
  })

  it('can define and initialize a device', async () => {
    WebXREventDispatcher.instance.dispatchEvent({
      type: POLYFILL_ACTIONS.DEVICE_INIT,
      detail: { stereoEffect: false, deviceDefinition }
    })

    await requestXRSession()

    assert(getState(XRState).session)
  })
})
