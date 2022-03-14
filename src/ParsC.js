import { useRef, useEffect, useState } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Object3D,
  Points,
  ShaderMaterial,
  Vector3,
  DoubleSide,
  Color,
  InstancedBufferAttribute,
  CircleBufferGeometry,
  InstancedBufferGeometry,
  Mesh,
  IcosahedronBufferGeometry,
} from "three";
import { getCurlNoise } from "./curlNosie";
import { useFrame } from "@react-three/fiber";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { TextureLoader } from "three";
import { SphereBuffer } from "./SphereBuffer";
import { sRGBEncoding } from "three";
import { getFbmPattern } from "./getFbmPattern";

// import { BlurPass, Resizer, KernelSize } from "postprocessing";

export function ParsC() {
  //
  let pointRef = useRef();
  let [prim, setPrim] = useState(null);

  let works = useRef({});
  useFrame((st, dt) => {
    Object.values(works.current).forEach((e) => e(st, dt));
  });
  useEffect(() => {
    let run = async () => {
      let o3d = new Object3D();

      let geo = new SphereBuffer(16, 150, 150);

      let displacement = new TextureLoader().load(
        `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/images/earth-displacement/2k_earth_specular_map-invert-displace.png`
      );

      let dayMap = new TextureLoader().load(
        `https://effectnode-2022.s3.ap-southeast-1.amazonaws.com/texture/images/earth-displacement/4k-earth-daytime.jpg`
      );
      dayMap.encoding = sRGBEncoding;

      //
      let uniforms = {
        displacement: { value: displacement },
        time: { value: 0 },
        dayMap: { value: dayMap },
      };

      //
      works.current.time = (st, dt) => {
        let t = st.clock.getElapsedTime();
        uniforms.time.value = t;
      };

      //
      let shader = new ShaderMaterial({
        uniforms,
        vertexShader: /* glsl */ `
          #include <common>


          mat3 calcLookAtMatrix(vec3 origin, vec3 target, float roll) {
            vec3 rr = vec3(sin(roll), cos(roll), 0.0);
            vec3 ww = normalize(target - origin);
            vec3 uu = normalize(cross(ww, rr));
            vec3 vv = normalize(cross(uu, ww));

            return mat3(uu, vv, ww);
          }


          vec3 LinearToSrgb(vec3 color) {
            // Approximation http://chilliant.blogspot.com/2012/08/srgb-approximations-for-hlsl.html
            vec3 linearColor = color.rgb;
            vec3 S1 = sqrt(linearColor);
            vec3 S2 = sqrt(S1);
            vec3 S3 = sqrt(S2);
            color.rgb = 0.662002687 * S1 + 0.684122060 * S2 - 0.323583601 * S3 - 0.0225411470 * linearColor;
            return color;
          }

        uniform float time;
        uniform float radius;

        uniform sampler2D displacement;
        uniform sampler2D dayMap;

        attribute vec3 inst_position;
        attribute vec3 inst_color;
        attribute vec3 inst_normal;
        attribute vec2 inst_uv;
        attribute float inst_size;

        varying vec3 v_inst_color;

        ${getFbmPattern()}

        void main (void) {
          float PIE = 3.14159265;

          //

          vec4 dayMapColor = texture2D(dayMap, inst_uv);
          vec4 displacementColor = texture2D(displacement, inst_uv);
          vec4 vert = vec4(
            inst_position + position
            , 1.0);

          v_inst_color = (1.0 - inst_color) * 0.5 + 0.7 * pattern(vec2(inst_uv.xy * 2.0), time * 0.5);

          if (displacementColor.r <= 0.5) {
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
            gl_FragColor = vec4(vec3(v_inst_color), 1.0);
          }
        `,
        transparent: true,
        side: DoubleSide,
      });

      let points = new Mesh(geo, shader);
      points.userData.enableBloom = true;
      points.frustumCulled = false;
      o3d.add(points);

      setPrim(<primitive ref={pointRef} object={o3d} />);
    };
    run();
  }, []);

  return <group>{prim}</group>;
}
