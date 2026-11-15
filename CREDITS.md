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

## Sketchfab survey models

Downloaded through the Sketchfab Download API by `scripts/fetch-sketchfab.mjs`, then modified by `scripts/prepare-sketchfab.mjs`: scaled to the real car's wheelbase, turned so the nose faces -z, baked wheels, tyres and brakes removed (and baked engines where listed), paint, glass and leather materials renamed, some untextured trim recoloured, wheel mount nodes added, re-compressed with Meshopt. Licences are as labelled on Sketchfab when downloaded (2026-11-15). CC Attribution needs only credit; derivatives are allowed.

| Car | Model | Author | Licence label | Link |
| --- | --- | --- | --- | --- |
| Toyota Supra A80 | "Toyota Supra MK IV (1994)" | Martin Trafas | CC Attribution | https://sketchfab.com/3d-models/none-eb9bb1eb41db431cb078088ae1ce45f8 |
| VW Golf GTI Mk1 | "Volkswagen Golf GTI 1976" | geevisual55 | CC Attribution | https://sketchfab.com/3d-models/none-4ab00bf79f2b413c8e89fb7ff5470249 |
| BMW M3 E30 | "[FREE] BMW M3 E30" | Martin Trafas | CC Attribution | https://sketchfab.com/3d-models/none-ac3c7013434e403e8faff87948caf422 |
| Mercedes 190E | "1984 Mercedes 190E" | Dave Love SketchFab | CC Attribution | https://sketchfab.com/3d-models/none-dc0799500bc4478296514b25a6541282 |
| Subaru Impreza GC8 | "Subaru Impreza WRX STi Version VI (GC8)" | Mona x Supercars | CC Attribution | https://sketchfab.com/3d-models/none-457f01e7e8d14b088e3f092c1be9e75c |
| Ford Mustang (1965) | "1965 Ford Mustang" | David_Holiday | CC Attribution | https://sketchfab.com/3d-models/none-7e93cc22b96a4788897a513374ef4486 |
| Lamborghini Countach 25th Anniversary | "1988 Lamborghini Countach" | Dave Love SketchFab | CC Attribution | https://sketchfab.com/3d-models/none-6ecbd718252143b1a83875357d003592 |
| Nissan Skyline GT-R R34 | "02' Nissan Skyline R34 GT-R" | DRIVER-FIRE | CC Attribution (doubtful, see below) | https://sketchfab.com/3d-models/none-14bee030e5d847b7ad16be3a28459222 |
| Mazda RX-7 FD | "1993_mazda_rx-7" | 007 | CC Attribution (doubtful, see below) | https://sketchfab.com/3d-models/none-8b828b5c888c43a1895228d48fe50c97 |
| Porsche 911 (964) | "1989 Porsche 911 (964) Carrera 4" | 007 | CC Attribution (doubtful, see below) | https://sketchfab.com/3d-models/none-22edb81d9ccf46c09a1add7a9ebda2c0 |

**Licence status: doubtful for three models.** The Skyline and RX-7 files use naming typical of assets extracted from a racing video game (`TNR0`, `lodA`, `Calliper18Na(Clone)`), so the uploaders probably did not hold the rights they licensed. The uploader "007" (RX-7 and 964) also lists a "1965 Ford Mustang Shelby GT350" with exactly the face count of Ddiaz Design's CC-BY-NC-SA model of the same car, which suggests re-uploads of other people's work. Treat these three as placeholders for local prototyping only, like the 458 above: replace them, or confirm their origin, before publishing, deploying or pushing the processed files to a public repository.

The first picks for the Mustang ("1965 Ford Mustang Convertible" by Kristian LaGrange) and the Countach ("Lamborghini Countach 5000QV" by Randomness) were downloaded but not used: the Mustang paints everything from one texture, so paint and wheels can't be separated, and the Countach has no colours or part names. They sit in `assets-src/rejected/`.
