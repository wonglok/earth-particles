import React, { useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
export function MyOrbitControls() {
  let { camera, gl } = useThree();
  let [orbit, setOrbit] = useState();
  useEffect(() => {
    let orbitControls = new OrbitControls(camera, gl.domElement);
    setOrbit(orbitControls);
  }, []);

  useFrame((st, dt) => {
    orbit?.update(dt);
  });
  //
  return <group></group>;
}
