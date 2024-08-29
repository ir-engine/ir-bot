import { MathUtils, Quaternion, Vector3 } from 'three'

import { iterativeMapToObject } from '@ir-engine/common/src/utils/mapToObject'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { getState } from '@ir-engine/hyperflux'

import { BotHooks, XRBotHooks } from '../enums/BotHooks'
import {
  getXRInputPosition,
  moveControllerStick,
  overrideXR,
  pressControllerButton,
  setXRInputPosition,
  startXR,
  tweenXRInputSource,
  updateController,
  updateHead,
  xrInitialized,
  xrSupported
} from './xrBotHookFunctions'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { NetworkState } from '@ir-engine/network'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { BotUserAgent } from '@ir-engine/common/src/constants/BotUserAgent'

export const BotHookFunctions = {
  [BotHooks.IsBot]: isBot,
  [BotHooks.LocationReady]: worldNetworkReady,
  [BotHooks.SceneLoaded]: sceneLoaded,
  [BotHooks.GetPlayerPosition]: getPlayerPosition,
  [BotHooks.GetPlayerRotation]: getPlayerRotation,
  [BotHooks.GetPlayerScale]: getPlayerScale,
  [BotHooks.GetPlayerTransform]: getPlayerTransform,
  [BotHooks.RotatePlayer]: rotatePlayer,
  [BotHooks.GetWorldNetworkPeers]: getPeers,
  [BotHooks.SerializeEngine]: serializeEngine,
  [XRBotHooks.OverrideXR]: overrideXR,
  [XRBotHooks.XRSupported]: xrSupported,
  [XRBotHooks.XRInitialized]: xrInitialized,
  [XRBotHooks.StartXR]: startXR,
  [XRBotHooks.UpdateHead]: updateHead,
  [XRBotHooks.UpdateController]: updateController,
  [XRBotHooks.PressControllerButton]: pressControllerButton,
  [XRBotHooks.MoveControllerStick]: moveControllerStick,
  [XRBotHooks.GetXRInputPosition]: getXRInputPosition,
  [XRBotHooks.SetXRInputPosition]: setXRInputPosition,
  [XRBotHooks.TweenXRInputSource]: tweenXRInputSource
}

// === ENGINE === //

export function isBot() {
  return navigator.userAgent === BotUserAgent
}

export function worldNetworkReady() {
  return NetworkState.worldNetwork?.ready
}

export function sceneLoaded() {
  return false // TODO
}

export function getPlayerPosition() {
  return getComponent(AvatarComponent.getSelfAvatarEntity(), TransformComponent)?.position
}
export function getPlayerRotation() {
  return getComponent(AvatarComponent.getSelfAvatarEntity(), TransformComponent)?.rotation
}
export function getPlayerScale() {
  return getComponent(AvatarComponent.getSelfAvatarEntity(), TransformComponent)?.scale
}
export function getPlayerTransform() {
  return getComponent(AvatarComponent.getSelfAvatarEntity(), TransformComponent)?.matrix
}
/**
 * @param {object} args
 * @param {number} args.angle in degrees
 */
export function rotatePlayer({ angle }) {
  const transform = getComponent(AvatarComponent.getSelfAvatarEntity(), TransformComponent)
  transform.rotation.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(angle)))
}

export function getPeers() {
  return Object.entries(NetworkState.worldNetwork.peers)
}

export function getWorldMetadata() {}

export function serializeEngine() {
  const engine = {
    userId: Engine.instance.userID,
    store: Engine.instance.store,
    xrFrame: getState(XRState).xrFrame,
    isEditor: getState(EngineState).isEditor
  }

  console.log(JSON.stringify(iterativeMapToObject(engine)))
  return JSON.stringify(iterativeMapToObject(engine))
}
