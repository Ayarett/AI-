import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import type {
  CharacterExpression,
  CharacterGender,
  CharacterOutfit,
} from '../types/platform';

export type TeacherDisplayMode = 'single' | 'both';

interface TeacherCharacter3DProps {
  gender: CharacterGender;
  outfit: CharacterOutfit;
  expression: CharacterExpression;
  displayMode?: TeacherDisplayMode;
  className?: string;
  hintText?: string;
}

const OUTFIT_COLORS: Record<
  CharacterOutfit,
  { jacket: number; accent: number; shirt: number; trousers: number; metal: number }
> = {
  classic: {
    jacket: 0x1e3a5f,
    accent: 0xd97706,
    shirt: 0xf8fafc,
    trousers: 0x1e293b,
    metal: 0xcbd5e1,
  },
  academic: {
    jacket: 0x0f5132,
    accent: 0xeab308,
    shirt: 0xfefce8,
    trousers: 0x1c1917,
    metal: 0xfde68a,
  },
  tech: {
    jacket: 0x27272a,
    accent: 0x0284c7,
    shirt: 0xf1f5f9,
    trousers: 0x0f172a,
    metal: 0x38bdf8,
  },
};

function createSculptedHeadGeometry(isFemale: boolean): THREE.LatheGeometry {
  // Smooth, attractive oval proportions with softer chin for female & defined jaw for male
  const jawWidth = isFemale ? 0.118 : 0.132;
  const cheekWidth = isFemale ? 0.156 : 0.162;
  const points = [
    new THREE.Vector2(0.001, -0.205),
    new THREE.Vector2(0.052, -0.194),
    new THREE.Vector2(jawWidth, -0.145),
    new THREE.Vector2(cheekWidth, -0.075),
    new THREE.Vector2(0.165, -0.01),
    new THREE.Vector2(0.168, 0.05),
    new THREE.Vector2(0.162, 0.115),
    new THREE.Vector2(0.135, 0.172),
    new THREE.Vector2(0.082, 0.212),
    new THREE.Vector2(0.001, 0.224),
  ];
  const geo = new THREE.LatheGeometry(points, 36);
  geo.scale(0.94, 1.0, 1.03);
  geo.computeVertexNormals();
  return geo;
}

function createTorsoGeometry(isFemale: boolean): THREE.LatheGeometry {
  const waist = isFemale ? 0.175 : 0.208;
  const shoulder = isFemale ? 0.235 : 0.268;
  const hip = isFemale ? 0.235 : 0.232;
  const points = [
    new THREE.Vector2(0.001, -0.34),
    new THREE.Vector2(hip, -0.335),
    new THREE.Vector2(waist, -0.14),
    new THREE.Vector2(waist + 0.015, -0.02),
    new THREE.Vector2(shoulder - 0.015, 0.15),
    new THREE.Vector2(shoulder, 0.27),
    new THREE.Vector2(shoulder - 0.045, 0.34),
    new THREE.Vector2(0.1, 0.365),
    new THREE.Vector2(0.001, 0.37),
  ];
  const geo = new THREE.LatheGeometry(points, 32);
  geo.scale(1.04, 1.0, 0.66);
  geo.computeVertexNormals();
  return geo;
}

function buildFemaleHair(
  hairMat: THREE.Material,
  goldMat: THREE.Material
): THREE.Group {
  const group = new THREE.Group();

  // Smooth inner crown hugging head cleanly
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(0.172, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat
  );
  crown.scale.set(0.97, 1.03, 1.06);
  crown.position.set(0, 0.036, -0.01);
  group.add(crown);

  // Back hair shell hugging occipital curve
  const backShell = new THREE.Mesh(
    new THREE.SphereGeometry(0.168, 24, 20, 0, Math.PI * 2, Math.PI * 0.25, Math.PI * 0.65),
    hairMat
  );
  backShell.scale.set(0.95, 1.05, 1.02);
  backShell.position.set(0, 0.01, -0.04);
  group.add(backShell);

  // Left & right smooth curtain-bang sweeps following the forehead contour (no sticking-out capsules)
  const leftBangCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.025, 0.178, 0.105),
    new THREE.Vector3(-0.065, 0.156, 0.138),
    new THREE.Vector3(-0.138, 0.088, 0.095),
    new THREE.Vector3(-0.158, -0.015, 0.012),
    new THREE.Vector3(-0.145, -0.105, -0.055),
  ]);
  const leftBang = new THREE.Mesh(
    new THREE.TubeGeometry(leftBangCurve, 24, 0.026, 12, false),
    hairMat
  );
  leftBang.scale.set(0.9, 1.0, 0.85);
  group.add(leftBang);

  const rightBangCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 0.178, 0.105),
    new THREE.Vector3(0.085, 0.152, 0.132),
    new THREE.Vector3(0.142, 0.084, 0.092),
    new THREE.Vector3(0.158, -0.015, 0.012),
    new THREE.Vector3(0.145, -0.105, -0.055),
  ]);
  const rightBang = new THREE.Mesh(
    new THREE.TubeGeometry(rightBangCurve, 24, 0.025, 12, false),
    hairMat
  );
  rightBang.scale.set(0.9, 1.0, 0.85);
  group.add(rightBang);

  // Neat side locks framing behind the ears smoothly
  const sideLockGeo = new THREE.CapsuleGeometry(0.028, 0.14, 6, 12);
  const leftLock = new THREE.Mesh(sideLockGeo, hairMat);
  leftLock.position.set(-0.142, -0.075, -0.045);
  leftLock.rotation.z = -0.08;
  const rightLock = new THREE.Mesh(sideLockGeo, hairMat);
  rightLock.position.set(0.142, -0.075, -0.045);
  rightLock.rotation.z = 0.08;
  group.add(leftLock, rightLock);

  // Graceful low chignon bun tucked neatly at the nape with subtle gold clasp
  const chignon = new THREE.Mesh(new THREE.SphereGeometry(0.076, 20, 18), hairMat);
  chignon.scale.set(1.08, 0.92, 0.82);
  chignon.position.set(0, -0.025, -0.178);
  group.add(chignon);

  const hairClasp = new THREE.Mesh(
    new THREE.TorusGeometry(0.042, 0.0065, 8, 24),
    goldMat
  );
  hairClasp.position.set(0, -0.015, -0.152);
  hairClasp.rotation.x = 0.35;
  group.add(hairClasp);

  return group;
}

function buildMaleHair(hairMat: THREE.Material): THREE.Group {
  const group = new THREE.Group();

  const crown = new THREE.Mesh(
    new THREE.SphereGeometry(0.172, 26, 20, 0, Math.PI * 2, 0, Math.PI * 0.54),
    hairMat
  );
  crown.scale.set(0.97, 1.02, 1.05);
  crown.position.set(0, 0.044, -0.012);
  group.add(crown);

  // Clean swept front hairstyle along hairline
  const waveCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.12, 0.13, 0.095),
    new THREE.Vector3(-0.04, 0.175, 0.118),
    new THREE.Vector3(0.06, 0.172, 0.115),
    new THREE.Vector3(0.135, 0.125, 0.082),
  ]);
  const frontWave = new THREE.Mesh(
    new THREE.TubeGeometry(waveCurve, 20, 0.032, 12, false),
    hairMat
  );
  group.add(frontWave);

  const backTaper = new THREE.Mesh(
    new THREE.CylinderGeometry(0.148, 0.124, 0.13, 20),
    hairMat
  );
  backTaper.position.set(0, 0.005, -0.055);
  group.add(backTaper);

  // Subtle sideburns
  const sideGeo = new THREE.BoxGeometry(0.018, 0.065, 0.035);
  const leftSide = new THREE.Mesh(sideGeo, hairMat);
  leftSide.position.set(-0.155, 0.035, 0.022);
  const rightSide = leftSide.clone();
  rightSide.position.x = 0.155;
  group.add(leftSide, rightSide);

  return group;
}

interface TeacherRig {
  root: THREE.Group;
  gender: CharacterGender;
  upperBody: THREE.Group;
  headGroup: THREE.Group;
  skirtMesh: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  jacketMat: THREE.MeshStandardMaterial;
  trousersMat: THREE.MeshStandardMaterial;
  shirtMat: THREE.MeshStandardMaterial;
  accentMat: THREE.MeshStandardMaterial;
  glassesMat: THREE.MeshStandardMaterial;
  glassesGroup: THREE.Group;
  leftEye: { irisGroup: THREE.Group; eyelid: THREE.Mesh };
  rightEye: { irisGroup: THREE.Group; eyelid: THREE.Mesh };
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  mouthSmile: THREE.Mesh;
  innerMouth: THREE.Mesh;
  leftArm: {
    shoulder: THREE.Group;
    elbow: THREE.Group;
    wrist: THREE.Group;
    pointerMesh: THREE.Mesh | null;
  };
  rightArm: {
    shoulder: THREE.Group;
    elbow: THREE.Group;
    wrist: THREE.Group;
    pointerMesh: THREE.Mesh | null;
  };
  applyOutfit: (outfit: CharacterOutfit) => void;
}

function createTeacherRig(
  gender: CharacterGender,
  outfit: CharacterOutfit,
  woodMat: THREE.Material
): TeacherRig {
  const isFem = gender === 'female';
  const palette = OUTFIT_COLORS[outfit];

  const skinMat = new THREE.MeshStandardMaterial({
    color: isFem ? 0xf6cfb6 : 0xf0c19d,
    roughness: 0.56,
    metalness: 0.02,
  });
  const lipMat = new THREE.MeshStandardMaterial({
    color: isFem ? 0xc96a68 : 0xb86d60,
    roughness: 0.42,
    metalness: 0.03,
  });
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xe8998a,
    roughness: 0.78,
    transparent: true,
    opacity: isFem ? 0.34 : 0.18,
  });
  const jacketMat = new THREE.MeshStandardMaterial({
    color: palette.jacket,
    roughness: 0.58,
    metalness: 0.06,
  });
  const trousersMat = new THREE.MeshStandardMaterial({
    color: palette.trousers,
    roughness: 0.65,
    metalness: 0.05,
  });
  const shirtMat = new THREE.MeshStandardMaterial({
    color: palette.shirt,
    roughness: 0.72,
    metalness: 0.02,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: palette.accent,
    roughness: 0.35,
    metalness: 0.28,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: isFem ? 0x261914 : 0x1e1815,
    roughness: 0.66,
    metalness: 0.08,
  });
  const scleraMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.02,
  });
  const irisMat = new THREE.MeshStandardMaterial({
    color: isFem ? 0x54341f : 0x3f2718,
    roughness: 0.28,
    metalness: 0.06,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x0b0f17,
    roughness: 0.15,
  });
  const lashMat = new THREE.MeshStandardMaterial({
    color: 0x1a1412,
    roughness: 0.5,
  });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const glassesMat = new THREE.MeshStandardMaterial({
    color: palette.metal,
    roughness: 0.2,
    metalness: 0.85,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.38,
    metalness: 0.15,
  });

  const root = new THREE.Group();

  // Pelvis & Legs
  const hipsGroup = new THREE.Group();
  hipsGroup.position.y = 0.76;
  root.add(hipsGroup);

  const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.18, 22), trousersMat);
  pelvis.scale.set(1.02, 1, 0.7);
  hipsGroup.add(pelvis);

  const legGeo = new THREE.CylinderGeometry(0.076, 0.058, 0.66, 16);
  const leftLeg = new THREE.Mesh(legGeo, isFem ? skinMat : trousersMat);
  leftLeg.position.set(-0.098, -0.37, 0);
  leftLeg.castShadow = true;
  const rightLeg = new THREE.Mesh(legGeo, isFem ? skinMat : trousersMat);
  rightLeg.position.set(0.098, -0.37, 0);
  rightLeg.castShadow = true;

  const shoeGeo = new THREE.CapsuleGeometry(0.05, 0.095, 6, 12);
  const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
  leftShoe.rotation.x = Math.PI / 2;
  leftShoe.scale.set(1, 1, 0.68);
  leftShoe.position.set(-0.098, -0.71, 0.042);
  const rightShoe = leftShoe.clone();
  rightShoe.position.x = 0.098;

  const skirtMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.205, 0.265, 0.44, 26),
    trousersMat
  );
  skirtMesh.scale.set(1.04, 1, 0.74);
  skirtMesh.position.y = -0.15;
  skirtMesh.visible = isFem;
  hipsGroup.add(leftLeg, rightLeg, leftShoe, rightShoe, skirtMesh);

  // Upper Body
  const upperBody = new THREE.Group();
  upperBody.position.y = 0.84;
  root.add(upperBody);

  const torsoMesh = new THREE.Mesh(createTorsoGeometry(isFem), jacketMat);
  torsoMesh.position.y = 0.34;
  torsoMesh.castShadow = true;
  upperBody.add(torsoMesh);

  // Shirt V-insert
  const shirtFront = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.32, 4), shirtMat);
  shirtFront.rotation.z = Math.PI;
  shirtFront.rotation.y = Math.PI / 4;
  shirtFront.scale.set(1.0, 1.0, 0.42);
  shirtFront.position.set(0, 0.52, 0.14);
  upperBody.add(shirtFront);

  // Lapels
  const lapelGeo = new THREE.BoxGeometry(0.05, 0.27, 0.028);
  const leftLapel = new THREE.Mesh(lapelGeo, jacketMat);
  leftLapel.position.set(-0.07, 0.54, 0.155);
  leftLapel.rotation.z = -0.24;
  const rightLapel = new THREE.Mesh(lapelGeo, jacketMat);
  rightLapel.position.set(0.07, 0.54, 0.155);
  rightLapel.rotation.z = 0.24;
  upperBody.add(leftLapel, rightLapel);

  if (isFem) {
    const collarRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.02, 8, 22),
      accentMat
    );
    collarRing.rotation.x = Math.PI / 2.2;
    collarRing.position.set(0, 0.67, 0.035);
    const brooch = new THREE.Mesh(new THREE.SphereGeometry(0.021, 12, 12), glassesMat);
    brooch.position.set(0, 0.61, 0.175);
    upperBody.add(collarRing, brooch);
  } else {
    const tieKnot = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.038, 0.028), accentMat);
    tieKnot.position.set(0, 0.64, 0.165);
    const tieBlade = new THREE.Mesh(new THREE.ConeGeometry(0.034, 0.24, 4), accentMat);
    tieBlade.rotation.z = Math.PI;
    tieBlade.scale.set(1, 1, 0.35);
    tieBlade.position.set(0, 0.5, 0.17);
    upperBody.add(tieKnot, tieBlade);
  }

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(isFem ? 0.058 : 0.068, isFem ? 0.072 : 0.082, 0.16, 18),
    skinMat
  );
  neck.position.set(0, 0.73, 0.01);
  upperBody.add(neck);

  // Head Group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.955, 0.02);
  upperBody.add(headGroup);

  const headMesh = new THREE.Mesh(createSculptedHeadGeometry(isFem), skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Ears
  const earGeo = new THREE.SphereGeometry(0.032, 12, 12);
  const leftEar = new THREE.Mesh(earGeo, skinMat);
  leftEar.scale.set(0.45, 1.1, 0.7);
  leftEar.position.set(-0.158, -0.012, -0.012);
  const rightEar = leftEar.clone();
  rightEar.position.x = 0.158;
  headGroup.add(leftEar, rightEar);

  // Subtle gold pearl earrings for female teacher
  if (isFem) {
    const earringGeo = new THREE.SphereGeometry(0.012, 10, 10);
    const eL = new THREE.Mesh(earringGeo, glassesMat);
    eL.position.set(-0.162, -0.042, -0.006);
    const eR = eL.clone();
    eR.position.x = 0.162;
    headGroup.add(eL, eR);
  }

  // Refined Nose
  const noseBridge = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.011, 0.042, 6, 10),
    skinMat
  );
  noseBridge.rotation.x = -0.2;
  noseBridge.position.set(0, 0.006, 0.168);
  const noseTip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 12), skinMat);
  noseTip.position.set(0, -0.022, 0.18);
  headGroup.add(noseBridge, noseTip);

  // Soft Warm Blush Cheeks
  const cheekGeo = new THREE.SphereGeometry(0.032, 12, 12);
  const leftCheek = new THREE.Mesh(cheekGeo, cheekMat);
  leftCheek.scale.set(1.25, 0.65, 0.35);
  leftCheek.position.set(-0.082, -0.038, 0.146);
  const rightCheek = leftCheek.clone();
  rightCheek.position.x = 0.082;
  headGroup.add(leftCheek, rightCheek);

  // Expressive Eyes with Lash Rim & Tracking Iris
  const makeEye = (xPos: number) => {
    const eyeSocket = new THREE.Group();
    eyeSocket.position.set(xPos, 0.026, 0.148);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.027, 16, 14), scleraMat);
    sclera.scale.set(1.18, 0.88, 0.62);
    eyeSocket.add(sclera);

    const irisGroup = new THREE.Group();
    irisGroup.position.set(0, 0, 0.0155);

    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.0145, 20), irisMat);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.0076, 14), pupilMat);
    pupil.position.z = 0.001;
    const glint = new THREE.Mesh(new THREE.CircleGeometry(0.0033, 10), glintMat);
    glint.position.set(0.0046, 0.0048, 0.002);
    irisGroup.add(iris, pupil, glint);
    eyeSocket.add(irisGroup);

    // Subtle upper lash line for beauty & depth
    const lashCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.026, 0.003, 0.01),
      new THREE.Vector3(0, 0.02, 0.016),
      new THREE.Vector3(0.026, 0.004, 0.01),
    ]);
    const lash = new THREE.Mesh(
      new THREE.TubeGeometry(lashCurve, 12, isFem ? 0.0032 : 0.0022, 6, false),
      lashMat
    );
    eyeSocket.add(lash);

    const eyelid = new THREE.Mesh(
      new THREE.SphereGeometry(0.029, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.5),
      skinMat
    );
    eyelid.scale.set(1.2, 0.94, 0.7);
    eyelid.rotation.x = -Math.PI * 0.48;
    eyeSocket.add(eyelid);

    headGroup.add(eyeSocket);
    return { irisGroup, eyelid };
  };

  const leftEye = makeEye(-0.056);
  const rightEye = makeEye(0.056);

  // Graceful Eyebrows
  const browGeo = new THREE.CapsuleGeometry(isFem ? 0.006 : 0.0082, 0.044, 6, 10);
  const leftBrow = new THREE.Mesh(browGeo, hairMat);
  leftBrow.rotation.z = Math.PI / 2 - 0.1;
  leftBrow.position.set(-0.057, 0.074, 0.16);
  const rightBrow = new THREE.Mesh(browGeo, hairMat);
  rightBrow.rotation.z = Math.PI / 2 + 0.1;
  rightBrow.position.set(0.057, 0.074, 0.16);
  headGroup.add(leftBrow, rightBrow);

  // Warm Natural Smile Curve
  const smileCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.032, 0.008, 0),
    new THREE.Vector3(-0.014, -0.002, 0.008),
    new THREE.Vector3(0, -0.004, 0.01),
    new THREE.Vector3(0.014, -0.002, 0.008),
    new THREE.Vector3(0.032, 0.008, 0),
  ]);
  const mouthSmile = new THREE.Mesh(
    new THREE.TubeGeometry(smileCurve, 16, 0.0055, 8, false),
    lipMat
  );
  mouthSmile.position.set(0, -0.088, 0.156);

  const innerMouth = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0x8b333d, roughness: 0.7 })
  );
  innerMouth.scale.set(1.2, 0.3, 0.45);
  innerMouth.position.set(0, -0.094, 0.157);
  headGroup.add(mouthSmile, innerMouth);

  // Sleek Glasses (mostly on Male or Academic style so Female face shines clearly)
  const glassesGroup = new THREE.Group();
  const lensL = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.0038, 8, 24), glassesMat);
  lensL.position.set(-0.056, 0.026, 0.175);
  const lensR = lensL.clone();
  lensR.position.x = 0.056;
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.004, 0.004), glassesMat);
  bridge.position.set(0, 0.029, 0.175);
  glassesGroup.add(lensL, lensR, bridge);
  glassesGroup.visible = !isFem && outfit !== 'tech';
  headGroup.add(glassesGroup);

  // Hair
  headGroup.add(isFem ? buildFemaleHair(hairMat, glassesMat) : buildMaleHair(hairMat));

  // Articulated 2-joint human arms + palms + fingers
  const buildArm = (side: -1 | 1, withPointer: boolean) => {
    const xShoulder = side * (isFem ? 0.255 : 0.285);
    const shoulder = new THREE.Group();
    shoulder.position.set(xShoulder, 0.595, 0);
    upperBody.add(shoulder);

    const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.066, 14, 14), jacketMat);
    shoulder.add(shoulderCap);

    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.056, 0.048, 0.25, 14),
      jacketMat
    );
    upperArm.position.y = -0.125;
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.y = -0.255;
    shoulder.add(elbow);

    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 12), jacketMat);
    elbow.add(elbowJoint);

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.037, 0.23, 14),
      jacketMat
    );
    forearm.position.y = -0.12;
    forearm.castShadow = true;
    elbow.add(forearm);

    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.039, 0.039, 0.024, 14), shirtMat);
    cuff.position.y = -0.235;
    elbow.add(cuff);

    const wrist = new THREE.Group();
    wrist.position.y = -0.255;
    elbow.add(wrist);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.066, 0.028), skinMat);
    palm.position.y = -0.032;
    wrist.add(palm);

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.01, 0.03, 4, 8), skinMat);
    thumb.position.set(-side * 0.032, -0.028, 0.012);
    thumb.rotation.z = side * 0.55;
    wrist.add(thumb);

    for (let f = 0; f < 4; f++) {
      const finger = new THREE.Mesh(new THREE.CapsuleGeometry(0.0075, 0.034, 4, 8), skinMat);
      finger.position.set(side * (-0.019 + f * 0.013), -0.082, 0.004);
      finger.rotation.x = 0.14;
      wrist.add(finger);
    }

    let pointerMesh: THREE.Mesh | null = null;
    if (withPointer) {
      pointerMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0045, 0.008, 0.4, 10),
        woodMat
      );
      pointerMesh.position.set(0, -0.2, 0.11);
      pointerMesh.rotation.x = Math.PI / 3;
      wrist.add(pointerMesh);
    }

    return { shoulder, elbow, wrist, pointerMesh };
  };

  const leftArm = buildArm(-1, false);
  const rightArm = buildArm(1, true);

  const applyOutfit = (nextOutfit: CharacterOutfit) => {
    const c = OUTFIT_COLORS[nextOutfit];
    jacketMat.color.setHex(c.jacket);
    trousersMat.color.setHex(c.trousers);
    accentMat.color.setHex(c.accent);
    shirtMat.color.setHex(c.shirt);
    glassesMat.color.setHex(c.metal);
    glassesGroup.visible = !isFem && nextOutfit === 'academic';
  };

  return {
    root,
    gender,
    upperBody,
    headGroup,
    skirtMesh,
    leftLeg,
    rightLeg,
    jacketMat,
    trousersMat,
    shirtMat,
    accentMat,
    glassesMat,
    glassesGroup,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    mouthSmile,
    innerMouth,
    leftArm,
    rightArm,
    applyOutfit,
  };
}

export function TeacherCharacter3D({
  gender,
  outfit,
  expression,
  displayMode = 'single',
  className = 'w-full h-72',
  hintText,
}: TeacherCharacter3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef({ gender, outfit, expression, displayMode });
  const pointerTargetRef = useRef({ x: 0, y: 0, active: false, waveUntil: 0 });
  const [webglFailed, setWebglFailed] = useState(false);

  stateRef.current = { gender, outfit, expression, displayMode };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    const width = Math.max(container.clientWidth, 240);
    const height = Math.max(container.clientHeight, 220);

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.07;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const canvas = renderer.domElement;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    canvas.style.cursor = 'pointer';
    container.innerHTML = '';
    container.appendChild(canvas);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const onContextRestored = () => setWebglFailed(false);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const updatePointerFromClient = (clientX: number, clientY: number, strong: boolean) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const normX = THREE.MathUtils.clamp((clientX - cx) / (rect.width * 0.52), -1, 1);
      const normY = THREE.MathUtils.clamp((clientY - cy) / (rect.height * 0.52), -1, 1);
      pointerTargetRef.current.x = strong ? normX : normX * 0.55;
      pointerTargetRef.current.y = strong ? normY : normY * 0.5;
      pointerTargetRef.current.active = true;
    };

    const onPointerMoveLocal = (e: PointerEvent) => {
      updatePointerFromClient(e.clientX, e.clientY, true);
    };
    const onPointerLeaveLocal = () => {
      pointerTargetRef.current.active = false;
    };
    const onWindowPointerMove = (e: PointerEvent) => {
      if (e.target === canvas || container.contains(e.target as Node)) return;
      updatePointerFromClient(e.clientX, e.clientY, false);
    };
    const onPointerClick = () => {
      pointerTargetRef.current.waveUntil = performance.now() + 1850;
    };

    container.addEventListener('pointermove', onPointerMoveLocal);
    container.addEventListener('pointerdown', onPointerMoveLocal);
    container.addEventListener('pointerleave', onPointerLeaveLocal);
    container.addEventListener('click', onPointerClick);
    window.addEventListener('pointermove', onWindowPointerMove, { passive: true });

    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 40);
    camera.position.set(0, 1.38, 3.15);
    camera.lookAt(0, 1.18, 0);

    // Warm sunlit classroom lighting
    const hemi = new THREE.HemisphereLight(0xf0f9ff, 0x334155, 0.9);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.8);
    keyLight.position.set(2.2, 3.8, 3.4);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.9);
    fillLight.position.set(-2.4, 2.2, 2.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfde68a, 0.7);
    rimLight.position.set(0, 2.5, -2.8);
    scene.add(rimLight);

    // Classroom Floor Platform
    const floorDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(1.25, 1.32, 0.08, 44),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.45, metalness: 0.08 })
    );
    floorDisc.position.y = 0.04;
    floorDisc.receiveShadow = true;
    scene.add(floorDisc);

    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.25,
      metalness: 0.6,
    });
    const floorRing = new THREE.Mesh(new THREE.TorusGeometry(1.26, 0.016, 10, 56), ringMat);
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = 0.082;
    scene.add(floorRing);

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x9a6b42,
      roughness: 0.65,
      metalness: 0.05,
    });

    // Build BOTH rigs so single or dual mode switches smoothly with zero recreation lag
    const femaleRig = createTeacherRig('female', outfit, woodMat);
    const maleRig = createTeacherRig('male', outfit, woodMat);
    femaleRig.root.position.y = 0.08;
    maleRig.root.position.y = 0.08;
    scene.add(femaleRig.root, maleRig.root);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const smoothPtr = { x: 0, y: 0 };
    let smoothCamZ = 3.15;

    const animateRig = (
      rig: TeacherRig,
      activeExpr: CharacterExpression,
      t: number,
      delta: number,
      phaseOffset: number
    ) => {
      const ptr = pointerTargetRef.current;
      const targetPtrX = ptr.active ? ptr.x : Math.sin(t * 0.55 + phaseOffset) * 0.14;
      const targetPtrY = ptr.active ? ptr.y : 0;
      const px = THREE.MathUtils.clamp(targetPtrX, -1, 1);
      const py = THREE.MathUtils.clamp(targetPtrY, -1, 1);

      rig.upperBody.position.y = 0.84 + Math.sin(t * 2.1 + phaseOffset) * 0.011;

      const blinkCycle = (t + phaseOffset * 1.1) % 3.4;
      const blinkAmount =
        blinkCycle > 3.24 ? Math.sin(((blinkCycle - 3.24) / 0.16) * Math.PI) : 0;
      const lidScaleY = 0.16 + blinkAmount * 0.95;
      rig.leftEye.eyelid.scale.y = lidScaleY;
      rig.rightEye.eyelid.scale.y = lidScaleY;

      rig.leftEye.irisGroup.position.x = THREE.MathUtils.clamp(smoothPtr.x * 0.0085, -0.009, 0.009);
      rig.leftEye.irisGroup.position.y = THREE.MathUtils.clamp(-smoothPtr.y * 0.006, -0.006, 0.006);
      rig.rightEye.irisGroup.position.x = rig.leftEye.irisGroup.position.x;
      rig.rightEye.irisGroup.position.y = rig.leftEye.irisGroup.position.y;

      let torsoRotY = smoothPtr.x * 0.2;
      let torsoRotX = -smoothPtr.y * 0.05;
      let headRotY = smoothPtr.x * 0.4;
      let headRotX = -smoothPtr.y * 0.24;
      let headRotZ = 0;

      let lShZ = -0.14;
      let lShX = -0.08;
      let lElbX = -0.35;
      let lElbZ = 0.05;
      let lWrZ = 0;

      let rShZ = 0.22 + smoothPtr.x * 0.42;
      let rShX = -0.35 + smoothPtr.y * 0.42;
      let rElbX = -0.65 + smoothPtr.y * 0.32;
      let rElbZ = 0.12 - smoothPtr.x * 0.35;
      let rWrZ = smoothPtr.x * 0.28;

      let mouthOpen = 0.28;
      let browY = 0.074;
      let showPointer = false;

      if (activeExpr === 'greeting') {
        rShZ = 1.62 + smoothPtr.x * 0.25;
        rShX = -0.45 + smoothPtr.y * 0.25;
        rElbX = -1.24;
        rElbZ = 0.35 + Math.sin(t * 7.5 + phaseOffset) * 0.42;
        rWrZ = Math.sin(t * 7.5 + phaseOffset - 0.5) * 0.36;
        lShZ = -0.16;
        lElbX = -0.5;
        headRotZ = rig.gender === 'female' ? -0.05 : 0.04;
        mouthOpen = 0.65;
        browY = 0.082;
      } else if (activeExpr === 'explaining') {
        showPointer = rig.gender === 'male';
        rShZ = 0.48 + px * 0.6 + Math.sin(t * 3.1 + phaseOffset) * 0.16;
        rShX = -0.75 + py * 0.42 + Math.cos(t * 2.6 + phaseOffset) * 0.12;
        rElbX = -0.8 + py * 0.22;
        rElbZ = -0.12 - px * 0.32;
        rWrZ = Math.sin(t * 4 + phaseOffset) * 0.22;

        lShZ = -0.24 - px * 0.14;
        lShX = -0.4 + Math.sin(t * 2.8 + phaseOffset) * 0.14;
        lElbX = -0.92 + Math.cos(t * 2.8 + phaseOffset) * 0.18;
        lElbZ = -0.2;
        lWrZ = 0.28;

        headRotX += Math.sin(t * 3.2 + phaseOffset) * 0.06;
        mouthOpen = 0.4 + Math.abs(Math.sin(t * 6.5 + phaseOffset)) * 0.4;
      } else if (activeExpr === 'happy') {
        rShZ = 1.2 + smoothPtr.x * 0.32 + Math.sin(t * 5.5 + phaseOffset) * 0.16;
        rShX = -0.48 + smoothPtr.y * 0.28;
        rElbX = -0.88;
        rElbZ = 0.22;

        lShZ = -1.2 + smoothPtr.x * 0.22 - Math.sin(t * 5.5 + phaseOffset) * 0.16;
        lShX = -0.48;
        lElbX = -0.88;
        lElbZ = -0.22;

        torsoRotX -= 0.04;
        mouthOpen = 0.85;
        browY = 0.086;
      } else if (activeExpr === 'thinking') {
        rShZ = 0.18 + smoothPtr.x * 0.18;
        rShX = -1.04 + smoothPtr.y * 0.2;
        rElbX = -1.62;
        rElbZ = 0.52;
        rWrZ = 0.18;

        lShZ = -0.12;
        lShX = -0.44;
        lElbX = -1.22;
        lElbZ = -0.62;

        headRotZ = 0.08;
        headRotY = -0.15 + smoothPtr.x * 0.25;
        mouthOpen = 0.18;
        browY = 0.081;
      } else {
        rShZ = 0.26 + smoothPtr.x * 0.55;
        rShX = -0.5 + smoothPtr.y * 0.46;
        rElbX = -0.8 + smoothPtr.y * 0.24;
        rElbZ = 0.08 - smoothPtr.x * 0.35;
        lShZ = -0.16;
        lShX = -0.22;
        lElbX = -0.45;
      }

      if (rig.rightArm.pointerMesh) {
        rig.rightArm.pointerMesh.visible = showPointer;
      }

      rig.upperBody.rotation.y = THREE.MathUtils.damp(rig.upperBody.rotation.y, torsoRotY, 7, delta);
      rig.upperBody.rotation.x = THREE.MathUtils.damp(rig.upperBody.rotation.x, torsoRotX, 7, delta);

      rig.headGroup.rotation.y = THREE.MathUtils.damp(rig.headGroup.rotation.y, headRotY, 8, delta);
      rig.headGroup.rotation.x = THREE.MathUtils.damp(rig.headGroup.rotation.x, headRotX, 8, delta);
      rig.headGroup.rotation.z = THREE.MathUtils.damp(rig.headGroup.rotation.z, headRotZ, 7, delta);

      rig.leftArm.shoulder.rotation.z = THREE.MathUtils.damp(rig.leftArm.shoulder.rotation.z, lShZ, 8, delta);
      rig.leftArm.shoulder.rotation.x = THREE.MathUtils.damp(rig.leftArm.shoulder.rotation.x, lShX, 8, delta);
      rig.leftArm.elbow.rotation.x = THREE.MathUtils.damp(rig.leftArm.elbow.rotation.x, lElbX, 9, delta);
      rig.leftArm.elbow.rotation.z = THREE.MathUtils.damp(rig.leftArm.elbow.rotation.z, lElbZ, 9, delta);
      rig.leftArm.wrist.rotation.z = THREE.MathUtils.damp(rig.leftArm.wrist.rotation.z, lWrZ, 9, delta);

      rig.rightArm.shoulder.rotation.z = THREE.MathUtils.damp(rig.rightArm.shoulder.rotation.z, rShZ, 9, delta);
      rig.rightArm.shoulder.rotation.x = THREE.MathUtils.damp(rig.rightArm.shoulder.rotation.x, rShX, 9, delta);
      rig.rightArm.elbow.rotation.x = THREE.MathUtils.damp(rig.rightArm.elbow.rotation.x, rElbX, 10, delta);
      rig.rightArm.elbow.rotation.z = THREE.MathUtils.damp(rig.rightArm.elbow.rotation.z, rElbZ, 10, delta);
      rig.rightArm.wrist.rotation.z = THREE.MathUtils.damp(rig.rightArm.wrist.rotation.z, rWrZ, 10, delta);

      rig.leftBrow.position.y = THREE.MathUtils.damp(rig.leftBrow.position.y, browY, 8, delta);
      rig.rightBrow.position.y = rig.leftBrow.position.y;
      rig.innerMouth.scale.y = THREE.MathUtils.damp(rig.innerMouth.scale.y, mouthOpen, 10, delta);
    };

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const st = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (st === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 70);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const t = clock.getElapsedTime();
      const {
        gender: curGender,
        outfit: curOutfit,
        expression: curExpr,
        displayMode: curMode,
      } = stateRef.current;

      femaleRig.applyOutfit(curOutfit);
      maleRig.applyOutfit(curOutfit);
      ringMat.color.setHex(OUTFIT_COLORS[curOutfit].accent);

      const isBoth = curMode === 'both';
      femaleRig.root.visible = isBoth || curGender === 'female';
      maleRig.root.visible = isBoth || curGender === 'male';

      if (isBoth) {
        femaleRig.root.position.x = THREE.MathUtils.damp(femaleRig.root.position.x, -0.44, 8, delta);
        maleRig.root.position.x = THREE.MathUtils.damp(maleRig.root.position.x, 0.44, 8, delta);
        femaleRig.root.rotation.y = 0.08;
        maleRig.root.rotation.y = -0.08;
        smoothCamZ = THREE.MathUtils.damp(smoothCamZ, 3.65, 6, delta);
      } else {
        femaleRig.root.position.x = THREE.MathUtils.damp(femaleRig.root.position.x, 0, 8, delta);
        maleRig.root.position.x = THREE.MathUtils.damp(maleRig.root.position.x, 0, 8, delta);
        femaleRig.root.rotation.y = 0;
        maleRig.root.rotation.y = 0;
        smoothCamZ = THREE.MathUtils.damp(smoothCamZ, 2.9, 6, delta);
      }
      camera.position.z = smoothCamZ;

      const ptr = pointerTargetRef.current;
      const targetPtrX = ptr.active ? ptr.x : Math.sin(t * 0.55) * 0.16;
      const targetPtrY = ptr.active ? ptr.y : 0;
      smoothPtr.x = THREE.MathUtils.damp(smoothPtr.x, targetPtrX, 7, delta);
      smoothPtr.y = THREE.MathUtils.damp(smoothPtr.y, targetPtrY, 7, delta);

      const isClickWaving = performance.now() < ptr.waveUntil;
      const activeExpr: CharacterExpression = isClickWaving ? 'greeting' : curExpr;

      if (femaleRig.root.visible) {
        animateRig(femaleRig, activeExpr, t, delta, 0);
      }
      if (maleRig.root.visible) {
        animateRig(maleRig, activeExpr, t, delta, 0.55);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    const handleResize = () => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 220);
      const h = Math.max(container.clientHeight, 200);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onWindowPointerMove);
      container.removeEventListener('pointermove', onPointerMoveLocal);
      container.removeEventListener('pointerdown', onPointerMoveLocal);
      container.removeEventListener('pointerleave', onPointerLeaveLocal);
      container.removeEventListener('click', onPointerClick);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, []);

  if (webglFailed) {
    return (
      <div
        className={`${className} rounded-2xl bg-sky-50/60 dark:bg-zinc-900 border border-sky-200 dark:border-zinc-800 flex flex-col items-center justify-center p-4 text-center`}
      >
        <p className="font-display text-sm font-bold text-slate-900 dark:text-zinc-100">
          AI Ұстаз
        </p>
        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
          3D-сцена отключена (WebGL недоступен в текущей среде)
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={mountRef}
        className={className}
        aria-label="Интерактивные 3D-учителя AI Ұстаз"
      />
      {hintText && (
        <p className="text-[11px] text-center text-slate-500 dark:text-zinc-400 mt-1.5">
          {hintText}
        </p>
      )}
    </div>
  );
}
