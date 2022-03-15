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

// import { BlurPass, Resizer, KernelSize } from "postprocessing";

export function ParsC({
  radius = 15.7,
  widthSegment = 200,
  heightSegment = 200,
  speedPulse = 1,
  randomness = 1,
  speedColor = 1,
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
  }, [radius, widthSegment, heightSegment, colors]);

  useEffect(() => {
    return () => {
      geo.dispose();
    };
  }, [geo]);
  //
  //
  //
  let uniforms = useMemo(() => {
    return {
      //
      displacement: { value: displacement },
      speedPulse: { value: speedPulse },
      speedColor: { value: speedColor },
      randomness: { value: randomness },

      time: { value: 0 },
    };
  }, [displacement, randomness, speedColor, speedPulse]);

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

        varying vec3 v_inst_color;

        ${getFbmPattern()}

        vec4 LinearTosRGB( in vec4 value ) {
         	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
        }

        void main (void) {
          float PIE = 3.14159265;

          //
          float rave = pattern(vec2(inst_uv.xy * 3.5), time * 0.5);

          vec4 displacementData = texture2D(displacement, inst_uv);

          vec4 vert = vec4(
            inst_position + position * (inst_size * 0.5 + 0.5)
          , 1.0);

          v_inst_color = inst_color.rgb;// * rave;

          if (displacementData.r <= 0.5) {
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

        void main (void) {
          gl_FragColor = vec4(v_inst_color, 1.0);
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
