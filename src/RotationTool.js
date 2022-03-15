import anime from "animejs/lib/anime.es.js";
import { Vector3 } from "three";
import { useRef, useEffect } from "react";
import { Object3D } from "three";
import { Euler } from "three";
import { Quaternion } from "three";
import TWEEN from "@tweenjs/tween.js";
import { useFrame } from "@react-three/fiber";
export function RotationTool({ children, coord = { lat: 0, lng: 0 } }) {
  let ref = useRef();

  useEffect(() => {
    let sphere = ref.current;
    let latitude = coord.lat;
    let longitude = coord.lng;

    var phi = (latitude * Math.PI) / 180;
    var theta = ((270 - longitude) * Math.PI) / 180;
    var euler = new Euler(phi, theta, 0, "XYZ");
    var qstart = new Quaternion().copy(sphere.quaternion); // src quaternion
    var qend = new Quaternion().setFromEuler(euler); //dst quaternion
    let tQ = new Quaternion();
    var o = { t: 0 };

    anime({
      tagets: [o],
      t: 100,
      duration: 1000,
      easing: "easeOutQuad",
      update: (aninm) => {
        tQ.slerpQuaternions(qstart, qend, aninm.progress / 100);
        sphere.quaternion.copy(tQ);
      },
    });

    return () => {};
  }, [coord]);

  useFrame((st, dt) => {
    TWEEN.update(dt);
  });

  return <group ref={ref}>{children}</group>;
}
