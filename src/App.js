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

      <ambientLight intensity={1}></ambientLight>
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
    //
    //
    earthColor: "#092762",

    //
    colorA: "#ff89ff",
    colorB: "#00ffff",
    colorC: "#0e2199",
    colorD: "#093a6f",

    eachScale: 1,
    eachRandomnesss: 0.3,

    pulseSpeed: 0.5,
    pulseAmp: 0.3,
    pulseUV: 10.0,
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
            //
            chosen.colorA,
            chosen.colorB,
            chosen.colorC,
            chosen.colorD,
          ]}
          radius={15.7}
          widthSegment={200}
          heightSegment={200}
          eachScale={chosen.eachScale}
          eachRandomnesss={chosen.eachRandomnesss}
          pulseSpeed={chosen.pulseSpeed}
          pulseAmp={chosen.pulseAmp}
          pulseUV={chosen.pulseUV}
        ></ParsC>
      </RotationTool>

      <HDR></HDR>
    </Suspense>
  );
}
