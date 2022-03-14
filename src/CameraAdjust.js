import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
// import { DirectionalLight } from "three";
export function CameraAdjust() {
  let { camera, scene, gl: renderer } = useThree();
  useEffect(() => {
    camera.position.z = 50;
    renderer.physicallyCorrectLights = true;
    // let light = new DirectionalLight(0xffffff, 10);
    // camera.add(light);
    // light.position.x = 100;
    // light.position.y = 100;
    // light.position.z = 0;
    // scene.add(camera);
  });
  return <group></group>;
}
