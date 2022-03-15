/* eslint-disable */
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import {
  sRGBEncoding,
  Layers,
  MeshBasicMaterial,
  Vector2,
  ShaderMaterial,
  Color,
} from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
// import { useTools } from "../useTools/useTools";

export const ENTIRE_SCENE = 0;
export const BLOOM_SCENE = 1;

export const enableBloom = (item) => {
  item.layers.enable(BLOOM_SCENE);
};

export function Bloom({ myCamera }) {
  // let tool = useTools();
  let { gl, size, scene, camera = myCamera } = useThree();
  //
  let {
    // baseRTT,
    //
    bloomComposer,
    finalComposer,
  } = useMemo(() => {
    gl.outputEncoding = sRGBEncoding;
    gl.physicallyCorrectLights = true;
    let bloomComposer = new EffectComposer(gl);
    bloomComposer.renderToScreen = false;
    let sizeV2 = new Vector2(window.innerWidth, window.innerHeight);

    let renderPass = new RenderPass(scene, camera);
    bloomComposer.addPass(renderPass);

    let unrealPass = new UnrealBloomPass(sizeV2, 1.5, 0.6, 0.5);
    unrealPass.renderToScreen = true;

    unrealPass.strength = 3;
    unrealPass.threshold = 0.05;
    unrealPass.radius = 1.0;
    unrealPass.setSize(size.width, size.height);

    bloomComposer.addPass(unrealPass);

    const finalComposer = new EffectComposer(gl);
    finalComposer.addPass(renderPass);
    finalComposer.renderToScreen = true;

    bloomComposer.renderTarget2.texture.encoding = sRGBEncoding;
    bloomComposer.renderTarget1.texture.encoding = sRGBEncoding;
    finalComposer.renderTarget2.texture.encoding = sRGBEncoding;
    finalComposer.renderTarget1.texture.encoding = sRGBEncoding;

    const finalPass = new ShaderPass(
      new ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: {
            value: bloomComposer.renderTarget2.texture,
          },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;

          varying vec2 vUv;

          void main() {
            gl_FragColor = LinearTosRGB( texture2D( baseTexture, vUv ) * 1.0 + 1.0 * texture2D( bloomTexture, vUv ) );
          }
        `,
        defines: {},
      }),
      "baseTexture"
    );
    //

    finalPass.needsSwap = true;
    finalComposer.addPass(finalPass);

    window.addEventListener(
      "resize",
      () => {
        let dpr = gl.getPixelRatio();

        gl.getSize(sizeV2);
        bloomComposer.setSize(sizeV2.x, sizeV2.y);
        finalComposer.setSize(sizeV2.x, sizeV2.y);

        bloomComposer.setPixelRatio(dpr);
        finalComposer.setPixelRatio(dpr);
      },
      false
    );

    window.dispatchEvent(new CustomEvent("resize"));

    return {
      bloomComposer,
      finalComposer,
    };
  }, []);

  // let materials = {};
  const darkMaterial = new MeshBasicMaterial({
    color: new Color(`#000000`),
  });

  const bloomLayer = new Layers();
  bloomLayer.set(BLOOM_SCENE);

  let cacheMap = new Map();
  function darkenNonBloomed(obj) {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      // materials[obj.uuid] = obj.material;
      cacheMap.set(obj.uuid, obj.material);
      obj.material = obj.userData.darkMaterial || darkMaterial;
    }
  }

  function restoreMaterial(obj) {
    if (cacheMap.has(obj.uuid)) {
      obj.material = cacheMap.get(obj.uuid);
      cacheMap.delete(obj.uuid);
    }
  }

  useFrame((state, dt) => {
    scene.traverse((it) => {
      if (it.userData.enableBloom) {
        enableBloom(it);
      }
    });
    let origBG = scene.background;

    //
    gl.shadowMap.enabled = false;
    scene.background = null;
    scene.traverse(darkenNonBloomed);
    bloomComposer.render(dt);
    //
    gl.shadowMap.enabled = true;
    scene.background = origBG;
    scene.traverse(restoreMaterial);
    finalComposer.render(dt);
  }, 10000);

  return <group></group>;
}
