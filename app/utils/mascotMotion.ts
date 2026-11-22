import type { Object3D } from 'three'

const DEG = Math.PI / 180
const DANCE_BEAT = 0.45 // seconds per dance pose
const DANCE_BOUNCE = 14 // degrees the knees dip on every beat
const LEG_LENGTH = 2.8 // thigh plus shin in model units, to lower the hips by what the knees bend
const OPEN_KNUCKLE = 30 // degrees the fingers uncurl at the knuckle when the hand opens
const OPEN_FINGERTIP = 60 // degrees the fingertips uncurl on top of that

// Degrees added to a joint axis (`arm_L.z`), plus `open` (left hand, 0 to 1) and `bend` (knees).
export type Pose = Record<string, number>
export type Motion = { dur: number, at: (t: number, pose: Pose) => void }

export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)
export const addToPose = (pose: Pose, key: string, value: number) => {
  pose[key] = (pose[key] ?? 0) + value
}

const GROOVE: Pose = { 'arm_R.z': -75, 'forearm_R.z': -35, 'arm_L.z': 45, 'torso.z': 6, 'head.z': -6 }
const GROOVE_BACK: Pose = { 'arm_L.z': 75, 'forearm_L.z': 35, 'arm_R.z': -45, 'torso.z': -6, 'head.z': 6 }
const PUMP: Pose = { 'arm_L.z': 80, 'forearm_L.z': 100, 'head.z': 12 }
const CHEER: Pose = { 'arm_L.z': 135, 'forearm_L.z': 20, 'arm_R.z': -135, 'forearm_R.z': -20, 'bend': 12 }
const POINT: Pose = { 'arm_R.z': -125, 'arm_L.z': 25, 'torso.z': 5, 'head.z': -8 }
const DAB: Pose = { 'arm_L.z': 95, 'arm_R.z': -30, 'torso.z': -8, 'head.z': 15 }
const DANCE = [GROOVE, GROOVE_BACK, GROOVE, GROOVE_BACK, PUMP, CHEER, CHEER, POINT, DAB]
const REST: Pose = {}
const dance = (t: number, pose: Pose) => {
  const beat = Math.floor(t / DANCE_BEAT)
  const from = DANCE[beat - 1] ?? REST
  const to = DANCE[beat] ?? REST
  // Poses snap in over the first part of a beat and hold for the rest.
  const u = easeInOut(Math.min(1, (t / DANCE_BEAT - beat) / 0.6))
  for (const key in from) addToPose(pose, key, from[key]! * (1 - u))
  for (const key in to) addToPose(pose, key, to[key]! * u)
  const fade = Math.min(1, t / DANCE_BEAT, (danceMotion.dur - t) / DANCE_BEAT)
  addToPose(pose, 'bend', fade * DANCE_BOUNCE * (0.5 - 0.5 * Math.cos(t / DANCE_BEAT * 2 * Math.PI)))
}
export const danceMotion: Motion = { dur: (DANCE.length + 1) * DANCE_BEAT, at: dance }

/** Returns a function that puts the rig into `pose`, with the head at `pitch` and `yaw` degrees. */
export const createPoser = (joints: Record<string, Object3D>) => {
  const head = joints.head!
  const pelvis = joints.pelvis!
  const pelvisRest = pelvis.position.y
  const posed = Object.entries(joints)
    .filter(([name]) => name !== 'head')
    .map(([name, joint]) => ({ name, joint, rest: joint.rotation.clone() }))
  const fingers = Object.entries(joints)
    .filter(([name]) => name.startsWith('finger_L'))
    .map(([name, joint]) => ({ joint, uncurl: name.endsWith('_tip') ? OPEN_FINGERTIP : OPEN_KNUCKLE }))

  return (pose: Pose, pitch: number, yaw: number) => {
    const bend = pose.bend ?? 0
    for (const side of ['L', 'R']) {
      addToPose(pose, `leg_${side}.x`, -bend)
      addToPose(pose, `shin_${side}.x`, 2 * bend)
      addToPose(pose, `foot_${side}.x`, -bend)
    }
    for (const { name, joint, rest } of posed) {
      joint.rotation.set(
        rest.x + (pose[`${name}.x`] ?? 0) * DEG,
        rest.y + (pose[`${name}.y`] ?? 0) * DEG,
        rest.z + (pose[`${name}.z`] ?? 0) * DEG
      )
    }
    head.rotation.set(pitch * DEG, yaw * DEG, (pose['head.z'] ?? 0) * DEG)
    pelvis.position.y = pelvisRest - LEG_LENGTH * (1 - Math.cos(bend * DEG))
    for (const { joint, uncurl } of fingers) joint.rotation.z += (pose.open ?? 0) * uncurl * DEG
  }
}
