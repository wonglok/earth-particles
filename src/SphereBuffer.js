// import { BufferGeometry } from "three/src/core/BufferGeometry.js";
// import { Float32BufferAttribute } from "three/src/core/BufferAttribute.js";
import { Vector3 } from "three/src/math/Vector3.js";
import { InstancedBufferGeometry } from "three";
import { IcosahedronBufferGeometry } from "three";
import { InstancedBufferAttribute } from "three";
import { Color } from "three";
// import { BoxBufferGeometry } from "three";

export class SphereBuffer {
  constructor(
    radius = 1,
    widthSegments = 32,
    heightSegments = 16,
    colors = [],
    phiStart = 0,
    phiLength = Math.PI * 2,

    thetaStart = 0,
    thetaLength = Math.PI
  ) {
    let variations = colors.map((hex) => {
      return {
        color: new Color(hex),
      };
    });

    widthSegments = Math.max(3, Math.floor(widthSegments));
    heightSegments = Math.max(2, Math.floor(heightSegments));

    const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

    let index = 0;
    const grid = [];

    const vertex = new Vector3();
    const normal = new Vector3();
    const color = new Vector3();
    // buffers

    const indices = [];
    const colorsArr = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    // generate vertices, normals and uvs

    for (let iy = 0; iy <= heightSegments; iy++) {
      const verticesRow = [];

      const v = iy / heightSegments;

      // special case for the poles

      let uOffset = 0;

      if (iy == 0 && thetaStart == 0) {
        uOffset = 0.5 / widthSegments;
      } else if (iy == heightSegments && thetaEnd == Math.PI) {
        uOffset = -0.5 / widthSegments;
      }

      for (let ix = 0; ix <= widthSegments; ix++) {
        const u = ix / widthSegments;

        // vertex
        vertex.x =
          -radius *
          Math.cos(phiStart + u * phiLength) *
          Math.sin(thetaStart + v * thetaLength);

        //
        vertex.y = radius * Math.cos(thetaStart + v * thetaLength);

        //
        vertex.z =
          radius *
          Math.sin(phiStart + u * phiLength) *
          Math.sin(thetaStart + v * thetaLength);

        vertices.push(vertex.x, vertex.y, vertex.z);

        // normal

        normal.copy(vertex).normalize();
        normals.push(normal.x, normal.y, normal.z);

        // uv

        uvs.push(u + uOffset, 1 - v);

        verticesRow.push(index++);

        let chosen = variations[Math.floor(Math.random() * variations.length)];

        colorsArr.push(chosen.color.r, chosen.color.b, chosen.color.g);
      }

      grid.push(verticesRow);
    }

    // indices

    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < widthSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];

        if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
        if (iy !== heightSegments - 1 || thetaEnd < Math.PI)
          indices.push(b, c, d);
      }
    }

    // build geometry

    // this.setIndex(indices);

    let sizes = [];
    for (let s = 0; s < vertices.length; s++) {
      sizes.push(Math.random());
    }

    // this.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    // this.setAttribute("normal", new Float32BufferAttribute(normals, 3));
    // this.setAttribute("uv", new Float32BufferAttribute(uvs, 2));

    let geo = new InstancedBufferGeometry();
    // geo.copy(new IcosahedronBufferGeometry(0.075, 0));
    geo.copy(new IcosahedronBufferGeometry(0.065, 0));
    geo.instanceCount = vertices.length / 3;

    geo.setAttribute(
      "inst_position",
      new InstancedBufferAttribute(new Float32Array(vertices), 3)
    );
    geo.setAttribute(
      "inst_normal",
      new InstancedBufferAttribute(new Float32Array(normals), 3)
    );
    geo.setAttribute(
      "inst_color",
      new InstancedBufferAttribute(new Float32Array(colorsArr), 3)
    );
    geo.setAttribute(
      "inst_uv",
      new InstancedBufferAttribute(new Float32Array(uvs), 2)
    );
    geo.setAttribute(
      "inst_size",
      new InstancedBufferAttribute(new Float32Array(sizes), 1)
    );
    return geo;
  }
}
