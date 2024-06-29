import React from 'react'
import { useHookstate, useImmediateEffect, useMutableState } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import { endXRSession, requestXRSession } from '@etherealengine/spatial/src/xr/XRSessionFunctions'

import { EmulatorSettings, emulatorStates } from './js/emulatorStates.js'
import EmulatedDevice from './js/emulatedDevice.js'
import { syncDevicePose } from './js/messenger.js'
import Devtool from './jsx/app'
import devtoolCSS from './styles/index.css?inline'
import { overrideXR } from '../src/functions/xrBotHookFunctions.js'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import { XRState } from '@etherealengine/spatial/src/xr/XRState.js'

const setup = async () => {
  await overrideXR()
  await EmulatorSettings.instance.load()
  const device = new EmulatedDevice()
  device.on('pose', syncDevicePose)
  ;(emulatorStates as any).emulatedDevice = device

  return device
}

export const EmulatorDevtools = () => {
  const xrState = useMutableState(XRState)
  const xrActive = xrState.sessionActive.value && !xrState.requestingSession.value

  const deviceState = useHookstate(null as null | EmulatedDevice)
  useImmediateEffect(() => {
    setup().then((device) => {
      deviceState.set(device)
    })
  }, [])

  const toggleXR = async () => {
    if (xrActive) {
      endXRSession()
    } else {
      requestXRSession({ mode: 'immersive-vr' })
    }
  }

  return (
    <>
      <style type="text/css">{devtoolCSS.toString()}</style>
      <div
        id="devtools"
        className="flex flex-no-wrap flex-col h-full overflow-hidden m-0 bg-gray-900 text-gray-900 text-xs select-none h-full overflow-hidden"
      >
        <Button className="my-1 ml-auto mr-6 px-10" onClick={toggleXR} disabled={xrState.requestingSession.value}>
          {xrActive ? 'Exit XR' : 'Enter XR'}
        </Button>
        {deviceState.value && <Devtool device={deviceState.value} />}
      </div>
    </>
  )
}
