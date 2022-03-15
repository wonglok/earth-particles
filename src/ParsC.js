import { useRef, useEffect, useState, useMemo } from "react";
import {
  Object3D,
  ShaderMaterial,
  DoubleSide,
  Mesh,

  //
  // BufferAttribute,
  // BufferGeometry,
  // Points,
  // Vector3,
  // Color,
  // InstancedBufferAttribute,
  // CircleBufferGeometry,
  // InstancedBufferGeometry,
  // IcosahedronBufferGeometry,
} from "three";
// import { getCurlNoise } from "./curlNosie";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
// import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { SphereBuffer } from "./SphereBuffer";
// import { sRGBEncoding } from "three";
import { getFbmPattern } from "./getFbmPattern";
import { Color } from "three";

// import { BlurPass, Resizer, KernelSize } from "postprocessing";

export function ParsC({
  radius = 15.7,
  widthSegment = 200,
  heightSegment = 200,

  eachScale = 0.5,
  eachRandomnesss = 0.5,

  pulseSpeed = 1.0,
  pulseAmp = 1.0,
  pulseUV = 1.0,

  colors = [],
}) {
  //
  let [mesh, setMesh] = useState(null);
  //
  let displacement = useTexture(
    `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/images/earth-displacement/2k_earth_specular_map-invert-displace.png`
  );

  //
  //
  let geo = useMemo(() => {
    return new SphereBuffer(radius, widthSegment, heightSegment, colors);
  }, [radius, widthSegment, heightSegment, colors.join(".")]);

  //
  //
  useEffect(() => {
    return () => {
      geo.dispose();
    };
  }, [geo]);
  //
  //
  //
  let uniforms = useMemo(() => {
    console.log(colors);
    return {
      //
      displacement: { value: displacement },
      pulseSpeed: { value: pulseSpeed },
      pulseAmp: { value: pulseAmp },
      pulseUV: { value: pulseUV },
      eachScale: { value: eachScale },
      eachRandomnesss: { value: eachRandomnesss },

      color0: { value: new Color(colors[0]) },
      color1: { value: new Color(colors[1]) },
      color2: { value: new Color(colors[2]) },
      color3: { value: new Color(colors[3]) },

      time: { value: 0 },
    };
  }, [displacement, eachScale, pulseUV, pulseSpeed, colors]);

  //
  //
  useFrame((st, dt) => {
    //
    uniforms.time.value += dt;
  });

  //
  let shader = useMemo(() => {
    let shader = new ShaderMaterial({
      uniforms: uniforms,
      vertexShader: /* glsl */ `
        #include <common>

        mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
          vec3 rr = vec3(sin(roll), cos(roll), 0.0);
          vec3 ww = normalize(target - origin);
          vec3 uu = normalize(cross(ww, rr));
          vec3 vv = normalize(cross(uu, ww));

          return mat3(uu, vv, ww);
        }

        uniform float time;
        uniform float radius;

        uniform sampler2D displacement;
        // uniform sampler2D dayMap;

        attribute vec3 inst_position;
        attribute vec3 inst_color;
        attribute vec3 inst_normal;
        attribute vec2 inst_uv;
        attribute float inst_size;

        varying float v_inst_size;
        varying vec3 v_inst_color;

        ${getFbmPattern()}

        vec4 LinearTosRGB( in vec4 value ) {
         	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
        }

        uniform float eachRandomnesss;
        uniform float eachScale;
        uniform float pulseUV;
        uniform float pulseSpeed;
        uniform float pulseAmp;

        void main (void) {
          //
          float PIE = 3.14159265;

          //
          float rave = pattern(vec2(inst_uv.xy * pulseUV), time * pulseSpeed) * pulseAmp;

          vec4 displacementData = texture2D(displacement, inst_uv);

          vec4 vert = vec4(
              inst_position

            + inst_normal * rave
            + position * (inst_size * eachRandomnesss + eachScale)
            ,
            1.0
          );

          v_inst_size = inst_size;
          v_inst_color = inst_color.rgb;// * rave;

          if (displacementData.r <= 0.1) {
            vert.w = 0.0;
            gl_Position = projectionMatrix * modelViewMatrix * vert;
          } else {
            gl_Position = projectionMatrix * modelViewMatrix * vert;
          }

        }
      `,
      fragmentShader: /* glsl */ `
        uniform float time;
        varying vec3 v_inst_color;
        varying float v_inst_size;

        uniform vec3 color0;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;

        void main (void) {

          if (v_inst_size >= 0.75) {
            gl_FragColor = vec4(color0, 1.0);
          } else if (v_inst_size >= 0.5) {
            gl_FragColor = vec4(color1, 1.0);
          } else if (v_inst_size >= 0.25) {
            gl_FragColor = vec4(color2, 1.0);
          } else {
            gl_FragColor = vec4(color3, 1.0);
          }

        }
      `,
      transparent: true,
      side: DoubleSide,
    });

    //
    return shader;
  }, [uniforms]);

  useEffect(() => {
    let myMesh = new Mesh(geo, shader);
    setMesh(<primitive object={myMesh}></primitive>);
    return () => {
      geo.dispose();
      shader.dispose();
    };
  }, [geo, shader]);

  return <group>{mesh}</group>;
}
