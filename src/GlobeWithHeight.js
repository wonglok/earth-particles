import React, { useState, useEffect } from "react";
import {
  SphereBufferGeometry,
  MeshStandardMaterial,
  Mesh,
  TextureLoader,
  sRGBEncoding,
  ShaderMaterial,
  EquirectangularReflectionMapping,
} from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { useFrame, useThree } from "@react-three/fiber";
import { Color } from "three";
import { Sphere } from "three";
import { RepeatWrapping } from "three";
export function GlobeWithHeight() {
  let [object, setObject] = useState(null);
  let [objectWater, setObjectWater] = useState(null);
  let [objectParticles, setObjectParticles] = useState(null);

  let { scene } = useThree();
  useEffect(() => {
    let displacement = new TextureLoader().load(
      `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/images/earth-displacement/2k_earth_specular_map-invert-displace.png`
    );
    // let normalMap = new TextureLoader().load(
    //   `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/images/earth-displacement/2k_earth_normal_map.png`
    // );
    // let nightMap = new TextureLoader().load(
    //   `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/images/earth-displacement/2k_earth_nightmap.png`
    // );
    // nightMap.encoding = sRGBEncoding;

    // let dayMap = new TextureLoader().load(
    //   `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/images/earth-displacement/4k-earth-daytime.jpg`
    // );
    // dayMap.encoding = sRGBEncoding;
    // let waterMap = new TextureLoader().load(
    //   `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/images/water/waternormals.jpg`
    // );

    let hdri = new RGBELoader();
    hdri.load(
      `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/hdri/sky/venice_sunset_1k.hdr`,
      (hdrImage) => {
        hdrImage.mapping = EquirectangularReflectionMapping;
        scene.environment = hdrImage;
        scene.background = new Color("#000000");
      }
    );

    let sea = new Color("#0c5a6d"); //.addScalar(-0.1);
    let hill = new Color("#0c6d1e").sub(new Color("#333333"));
    let waterGeo = new SphereBufferGeometry(15.2, 32, 32);
    let waterMat = new MeshStandardMaterial({
      color: sea.clone().sub(new Color("#333333")),
      roughness: 0.5,
      metalness: 1.0,
      // normalMap: waterMap,
      transparent: true,
      opacity: 0.85,
    });
    let water = new Mesh(waterGeo, waterMat);
    setObjectWater(water);

    let ballGeo = new SphereBufferGeometry(15, 512, 512);
    let uniforms = {
      hillColor: { value: hill },
      seaColor: { value: sea },
      // normalMap: { value: normalMap },
      // nightMap: { value: nightMap },
      // dayMap: { value: dayMap },
      normalMap: { value: null },
      nightMap: { value: null },
      dayMap: { value: null },
      displacement: { value: displacement },
    };
    let ballMat = new ShaderMaterial({
      uniforms,
      vertexShader: `
        uniform sampler2D displacement;
        varying vec4 vNewPos;
        varying vec2 vMyUv;
        varying vec3 vCamPos;

        void main (void) {
          vMyUv = uv;
          vCamPos = cameraPosition.rgb;
          vec4 displacementColor = texture2D(displacement, uv);
          vec4 newPos = vec4(normal * displacementColor.rgb, 1.0);
          vNewPos = modelMatrix * newPos;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position - normal * 0.1 + newPos.xyz, 1.0);
        }
      `,
      fragmentShader: `
        varying vec4 vNewPos;
        varying vec2 vMyUv;
        varying vec3 vCamPos;
        uniform sampler2D normalMap;
        uniform sampler2D nightMap;
        uniform sampler2D dayMap;
        uniform vec3 hillColor;
        uniform vec3 seaColor;

        void main (void) {
          vec4 dayColor = texture2D(dayMap, vMyUv);
          vec4 nightColor = texture2D(nightMap, vMyUv);
          vec4 normalColor = texture2D(normalMap, vMyUv);
          float floorRatio = pow(dot(normalize(vNewPos.rgb), vNewPos.rgb), 3.0);


          // dayColor.rgb * + nightColor.rgb
          gl_FragColor = vec4(mix(seaColor, hillColor, floorRatio), 1.0);
        }
      `,
    });
    let mesh = new Mesh(ballGeo, ballMat);
    setObject(mesh);
  }, []);

  useFrame(({ clock }) => {
    let t = clock.getElapsedTime();
    if (objectWater) {
      // objectWater.material.normalMap.wrapS = RepeatWrapping;
      // objectWater.material.normalMap.wrapT = RepeatWrapping;
      // objectWater.material.normalMap.repeat.set(3.0, 3.0);
      // objectWater.material.normalMap.offset.set(t * 0.01, t * 0.01);
    }
  });

  return (
    <group>
      {object && (
        <>
          <primitive object={object} />
        </>
      )}
      {objectWater && (
        <>
          <primitive object={objectWater} />
        </>
      )}
      {objectParticles && (
        <>
          <primitive object={objectParticles} />
        </>
      )}
    </group>
  );
}
