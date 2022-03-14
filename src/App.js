import React, { Suspense } from "react";
import "./style.css";
import { Canvas } from "@react-three/fiber";
import { GlobeWithHeight } from "./GlobeWithHeight.js";
import { CameraAdjust } from "./CameraAdjust.js";
import { MyOrbitControls } from "./MyOrbitControls.js";
import { ParsC } from "./ParsC.js";
import { Bloom } from "./Bloom.jsx";

export default function App() {
  return (
    <Canvas style={{ height: "100vh" }}>
      <Suspense fallback={null}>
        <GlobeWithHeight></GlobeWithHeight>
        <ParsC></ParsC>
      </Suspense>
      <Bloom></Bloom>
      <CameraAdjust />
      <ambientLight intensity={30} />
      <MyOrbitControls />
      {/* <directionalLight intensity={1} position={[100, 0, -100]} /> */}
    </Canvas>
  );
}
