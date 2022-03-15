import { useLoader, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Color } from "three";
import { EquirectangularReflectionMapping } from "three";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
export function HDR() {
  let { scene } = useThree((s) => {
    return {
      scene: s.scene,
    };
  });

  let hdr = useLoader(RGBELoader, `/spaichingen_hill_1k.hdr`);

  useEffect(() => {
    hdr.mapping = EquirectangularReflectionMapping;
    scene.environment = hdr;
    scene.background = new Color("#02021C");
  }, [hdr]);

  //
  return null;
}
