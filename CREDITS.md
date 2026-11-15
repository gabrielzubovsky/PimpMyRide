# Credits

## 3D model

**Licence status: unverified.** Checked on 2026-11-14: the original Sketchfab listing is disabled and the Sketchfab API returns 404 for it, so the model's licence could not be confirmed. Treat it as unverified. It is acceptable as a placeholder for local prototyping only. Before publishing or deploying the app, or pushing the processed model to a public repository, the licence must be confirmed or the model replaced.

- Title: "Ferrari 458 Italia", by vicent091036. The mesh is the open-top 458 Spider body (no roof, twin buttresses behind the seats), which is why the app labels it Ferrari 458 Spider.
- Original listing (disabled): https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6
- File downloaded from the three.js examples repository: https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/ferrari.glb
- Modified by `scripts/prepare-car.mjs`: stock wheels removed and replaced with empty mount nodes, some meshes renamed, re-compressed with Meshopt.

The raw download in `assets-src/` is gitignored. The processed file `public/models/ferrari-458-spider.glb` is not gitignored, so whether to commit it is the owner's decision, made with the licence status above in mind.

## Fonts

- Archivo (variable), via the npm package `@fontsource-variable/archivo`. SIL Open Font License 1.1.

## Libraries

All free and open source.

| Library | Licence |
| --- | --- |
| three.js | MIT |
| React | MIT |
| React Three Fiber | MIT |
| drei | MIT |
| zustand | MIT |
| Vite | MIT |
| TypeScript | Apache-2.0 |
| glTF Transform | MIT |
| meshoptimizer | MIT |
| draco3dgltf | Apache-2.0 |

## Trademarks

Ferrari, BBS, RAYS / Volk Racing, Yokohama / Advan and HRE are trademarks of their respective owners. They are used only to identify the real products. This project is not affiliated with or endorsed by any of them.

## Parts data accuracy

The parts data in `src/data/` is seed data written from memory, not researched from sellers. Wheel prices, the sizes each wheel is sold in, the factory wheel offsets and the paint swatch colours are approximate. Catalogue entries carry `verified: false` until checked. The wheel designs are stylised versions of the real wheels, not measured copies.

## Porsche 911 Carrera 4S model

- Title: "(FREE) Porsche 911 Carrera 4S", by Karol Miklas. Licence: CC-BY-SA-4.0 (embedded in the file's asset metadata).
- Original listing: https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf
- File downloaded from the HoanghoDev/3dmodel GitHub mirror: https://raw.githubusercontent.com/HoanghoDev/3dmodel/main/model/free_porsche_911_carrera_4s.glb
- Modified by `scripts/prepare-porsche.mjs`: reoriented, baked wheels/brakes and ground shadow removed, mount nodes added, re-compressed with Meshopt.
- Share-alike note: the processed model is a derivative and stays CC-BY-SA-4.0 if redistributed.
