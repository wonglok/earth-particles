import React, { Suspense } from "react";
import "./style.css";
import { Canvas } from "@react-three/fiber";
import { GlobeWithHeight } from "./GlobeWithHeight.js";
import { CameraAdjust } from "./CameraAdjust.js";
import { MyOrbitControls } from "./MyOrbitControls.js";
import { ParsC } from "./ParsC.js";
import { Bloom } from "./Bloom.jsx";
import { RotationTool } from "./RotationTool";
import { HDR } from "./HDR";
import { useControls, button } from "leva";
import { useMemo } from "react";
import { useState } from "react";

export default function App() {
  let [orbit, setOrbit] = useState(true);
  const chosen = useControls({
    resetCamera: button((get) => {
      setOrbit(false);
      setTimeout(() => {
        setOrbit(true);
      }, 10);
    }),
  });

  return (
    <Canvas style={{ height: "100vh" }}>
      <CanvasContent></CanvasContent>
      <Bloom></Bloom>

      <CameraAdjust />
      {orbit && <MyOrbitControls key={chosen.resetCamera} />}
    </Canvas>
  );
}

function CanvasContent() {
  let placesDB = [
    { name: "Aberdeen, Scotland", lat: 57, lng: 9 },
    { name: "Algiers, Algeria", lat: 36, lng: 50 },
    { name: "Debug", lat: 0, lng: 0 },
  ];

  const chosen = useControls({
    place: {
      value: placesDB.map((e) => e.name)[0],
      options: placesDB.map((e) => e.name),
    },
    earthColor: "#092762",
    particleColorA: "#ff89ff",
    particleColorB: "#00ffff",
    particleColorC: "#0e2199",
    particleColorD: "#093a6f",
  });

  let chosenCoord = useMemo(() => {
    return placesDB.find((e) => e.name === chosen.place) || placesDB[0];
  }, [chosen.place, placesDB]);

  return (
    <Suspense fallback={null}>
      <RotationTool coord={chosenCoord}>
        <mesh>
          <sphereBufferGeometry args={[15.5, 32, 32]}></sphereBufferGeometry>
          <meshStandardMaterial
            transparent={true}
            opacity={1}
            color={chosen.earthColor}
            roughness={1}
            metalness={0}
          ></meshStandardMaterial>
        </mesh>
        <ParsC
          colors={[
            chosen.particleColorA,
            chosen.particleColorB,
            chosen.particleColorC,
            chosen.particleColorD,
          ]}
          radius={15.7}
          widthSegment={200}
          heightSegment={200}
          speedPulse={1}
          randomness={1}
          speedColor={1}
        ></ParsC>
      </RotationTool>

      <HDR></HDR>
    </Suspense>
  );
}
