import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  VideoTexture,
  sRGBEncoding,
  Object3D,
  PlaneBufferGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  DynamicDrawUsage,
  InstancedMesh,
  DoubleSide,
  CatmullRomCurve3,
  Vector3,
  BoxBufferGeometry,
} from 'three';

export function VideoElement(props) {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef();
  // Hold state for hovered and clicked events
  const [videoTex, setVideoTex] = useState(null);
  const [aspect, setAspect] = useState(1);
  const [scale, setScale] = useState(30);
  const [visible, setVisible] = useState(false);
  const [o3d, setO3D] = useState(new Object3D());
  const [count, setCount] = useState(30);
  const [inst, setInst] = useState(
    new InstancedMesh(undefined, undefined, count)
  );
  useEffect(() => {
    //
    let videoURL =
      props.videoURL ||
      `https://moral-metaverse-media.s3.ap-northeast-1.amazonaws.com/kindness-seminar-2022/mary-elizabeth.mp4`;

    //
    let videoElement = document.createElement('video');
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.src = videoURL;
    videoElement.muted = true;
    videoElement.crossOrigin = 'aynonmous';
    videoElement.onloadeddata = () => {
      videoElement.play();
      setAspect(videoElement.videoWidth / videoElement.videoHeight);
      setVisible(true);
    };

    let videoTexture = new VideoTexture(videoElement);
    videoTexture.encoding = sRGBEncoding;
    videoTexture.flipY = true;
    setVideoTex(videoTexture);

    return () => {
      videoElement.stop();
      videoElement.pause();
      videoTexture.src = '';
      setVisible(false);
    };
  }, [props.videoURL]);

  //

  useFrame(() => {
    if (videoTex) {
      videoTex.needsUpdate = true;
    }
  });

  let geo = useMemo(() => {
    let geometry = new PlaneBufferGeometry(1, 1, 1);
    // geometry.rotateX(Math.PI * 0.5);
    return geometry;
  }, []);

  let mat = useMemo(() => {
    let material = new MeshBasicMaterial({ map: videoTex, side: DoubleSide });
    return material;
  }, [videoTex]);

  useEffect(() => {
    let iNewInst = new InstancedMesh(geo, mat, count);
    iNewInst.instanceMatrix.setUsage(DynamicDrawUsage);

    setInst(iNewInst);
  }, [geo, mat, count]);

  let curve = useMemo(() => {
    const curve = new CatmullRomCurve3(
      [
        new Vector3(-10, 0, 10),
        new Vector3(-5, 5, 5),
        new Vector3(0, 0, 0),
        new Vector3(5, -5, -5),
        new Vector3(10, 0, 10),
      ],
      false,
      'catmullrom',
      0.5
    );

    return curve;
  }, []);

  //
  useFrame(({ clock, camera }) => {
    //
    let t = clock.getElapsedTime();

    //
    if (inst && o3d) {
      for (let i = 0; i < count; i++) {
        o3d.matrix.identity();

        let ev = i / count; // * 2.0 - 1.0;

        // o3d.position.set(ev * 20.3, 0, 0);

        curve.getPoint(ev, o3d.position);

        o3d.lookAt(camera.position);
        o3d.scale.x = 1 * aspect;
        o3d.updateMatrix();

        inst.setMatrixAt(i, o3d.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
    }
  });

  //
  return (
    <group {...props} scale={1}>
      <primitive object={inst} />
    </group>
  );
}
