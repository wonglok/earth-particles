import React, { useEffect, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
export function MyOrbitControls({ reload }) {
  let { camera, gl } = useThree();
  let [orbit, setOrbit] = useState();
  useEffect(() => {
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.position.z = 20;
    let orbitControls = new OrbitControls(camera, gl.domElement);
    // orbitControls.enableRotate = false;
    // orbitControls.enablePan = false;
    setOrbit(orbitControls);

    return () => {
      orbitControls.dispose();
    };
  }, [reload]);

  useFrame((st, dt) => {
    orbit?.update(dt);
  });
  //
  return <group></group>;
}
