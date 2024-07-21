import { mockEngineRenderer } from '@etherealengine/spatial/tests/util/MockEngineRenderer'
import { createEngine, destroyEngine } from '@etherealengine/ecs/src/Engine'
import { initializeSpatialEngine } from '@etherealengine/spatial/src/initializeEngine'
import { requestXRSession } from '@etherealengine/spatial/src/xr/XRSessionFunctions'
import { describe, it, beforeEach, afterEach, assert, beforeAll } from 'vitest'
import { WebXREventDispatcher } from '../webxr-emulator/WebXREventDispatcher'
import { POLYFILL_ACTIONS } from '../webxr-emulator/actions'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { XRState } from '@etherealengine/spatial/src/xr/XRState'
import { EngineState } from '@etherealengine/spatial/src/EngineState'
import { RendererComponent } from '@etherealengine/spatial/src/renderer/WebGLRendererSystem'
import { ECSState, Timer, getMutableComponent, setComponent } from '@etherealengine/ecs'

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

const mockCanvas = () => {
  return {
    getDrawingBufferSize: () => 0,
    getContext: () => {},
    parentElement: {
      clientWidth: 100,
      clientHeight: 100
    }
  } as any as HTMLCanvasElement
}

describe('WebXR', () => {
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
    mockEngineRenderer(viewerEntity, mockCanvas())
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
