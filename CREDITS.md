# Credits

Pimp My Ride is built on other people's work. This page credits all of it. The app also shows each car model's credit on screen, under the car's name, and in full in the build sheet's Car line, because Creative Commons Attribution asks for the credit where the work is shown.

## 3D car models

Each model was modified for the garage: scaled to the real car's size, turned to face forward, its own wheels, tyres and brakes removed (the garage generates its own), materials renamed or recoloured, mount points added and the file recompressed. The 458 and 992 were prepared by `scripts/prepare-car.mjs` and `scripts/prepare-porsche.mjs`; the others were downloaded through the Sketchfab Download API by `scripts/fetch-sketchfab.mjs` and prepared by `scripts/prepare-sketchfab.mjs`. Licences are as labelled on Sketchfab when checked on 2026-11-15.

| Car in the app | Model | Author | Licence |
| --- | --- | --- | --- |
| Toyota Supra A80 | ["Toyota Supra MK IV (1994)"](https://sketchfab.com/3d-models/toyota-supra-mk-iv-1994-eb9bb1eb41db431cb078088ae1ce45f8) | [Martin Trafas](https://sketchfab.com/TinoD2) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| BMW M3 E30 | ["[FREE] BMW M3 E30"](https://sketchfab.com/3d-models/free-bmw-m3-e30-ac3c7013434e403e8faff87948caf422) | [Martin Trafas](https://sketchfab.com/TinoD2) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| VW Golf GTI Mk1 | ["Volkswagen Golf GTI 1976"](https://sketchfab.com/3d-models/volkswagen-golf-gti-1976-4ab00bf79f2b413c8e89fb7ff5470249) | [geevisual55](https://sketchfab.com/geevisual55) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Mercedes-Benz 190E | ["1984 Mercedes 190E"](https://sketchfab.com/3d-models/1984-mercedes-190e-dc0799500bc4478296514b25a6541282) | [Dave Love SketchFab](https://sketchfab.com/Tyler_Dave) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Lamborghini Countach 25th Anniversary | ["1988 Lamborghini Countach"](https://sketchfab.com/3d-models/1988-lamborghini-countach-6ecbd718252143b1a83875357d003592) | [Dave Love SketchFab](https://sketchfab.com/Tyler_Dave) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Subaru Impreza WRX STI GC8 | ["Subaru Impreza WRX STi Version VI (GC8)"](https://sketchfab.com/3d-models/subaru-impreza-wrx-sti-version-vi-gc8-457f01e7e8d14b088e3f092c1be9e75c) | [Mona x Supercars](https://sketchfab.com/Car2022) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Ford Mustang (1965) | ["1965 Ford Mustang"](https://sketchfab.com/3d-models/1965-ford-mustang-7e93cc22b96a4788897a513374ef4486) | [David_Holiday](https://sketchfab.com/David_Holiday) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| Porsche 911 Carrera 4S (992) | ["(FREE) Porsche 911 Carrera 4S"](https://sketchfab.com/3d-models/free-porsche-911-carrera-4s-d01b254483794de3819786d93e0e1ebf) | Karol Miklas ([Lionsharp Studios](https://sketchfab.com/lionsharp)) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| Nissan Skyline GT-R R34 | ["02' Nissan Skyline R34 GT-R"](https://sketchfab.com/3d-models/02-nissan-skyline-r34-gt-r-14bee030e5d847b7ad16be3a28459222) | [DRIVER-FIRE](https://sketchfab.com/DRIVER-FIRE) | CC BY 4.0 as labelled; **doubtful**, see below |
| Mazda RX-7 FD | ["1993_mazda_rx-7"](https://sketchfab.com/3d-models/1993-mazda-rx-7-8b828b5c888c43a1895228d48fe50c97) | [007](https://sketchfab.com/tangwang920) | CC BY 4.0 as labelled; **doubtful**, see below |
| Porsche 911 (964) | ["1989 Porsche 911 (964) Carrera 4"](https://sketchfab.com/3d-models/1989-porsche-911-964-carrera-4-22edb81d9ccf46c09a1add7a9ebda2c0) | [007](https://sketchfab.com/tangwang920) | CC BY 4.0 as labelled; **doubtful**, see below |
| Ferrari 458 Spider | "Ferrari 458 Italia" ([listing, now disabled](https://sketchfab.com/models/57bf6cc56931426e87494f554df1dab6)) | vicent091036 | **unconfirmed**, see below |

Notes on individual models:

- **Ferrari 458.** The file comes from the [three.js examples](https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf) (`ferrari.glb`). The model is titled "Ferrari 458 Italia", but the mesh is the open-top Spider body, so the app calls it a 458 Spider.
- **Porsche 992.** The file comes from the [HoanghoDev/3dmodel](https://github.com/HoanghoDev/3dmodel) GitHub mirror. The file's own metadata names Karol Miklas as the author; Sketchfab lists the model under Lionsharp Studios. It is share-alike: the processed model is a derivative and stays CC BY-SA 4.0 if redistributed. It has no interior.
- **Mustang.** A hardtop coupe with no window glass in the model.
- **Countach.** The model is the 1988 25th Anniversary, so the app lists that version rather than the 5000 QV.

### Licence concerns

These models are fine as placeholders for local prototyping. Before publishing or deploying the app, or pushing the processed models to a public repository, replace them or confirm their licences. The app says so in each one's credit.

- **Ferrari 458: unconfirmed.** Checked on 2026-11-14: the original Sketchfab listing is disabled and the API returns 404 for it, so the licence could not be confirmed.
- **Skyline and RX-7: doubtful.** Their files use naming typical of assets extracted from a racing video game (`TNR0`, `lodA`, `Calliper18Na(Clone)`), so the uploaders probably did not hold the rights they licensed.
- **964 (and the RX-7): doubtful.** The uploader "007" also lists a "1965 Ford Mustang Shelby GT350" with exactly the face count of Ddiaz Design's CC BY-NC-SA model of the same car, which suggests re-uploads of other people's work.

### Downloaded but not used

Also credited, as their files were downloaded while choosing models. They sit in `assets-src/rejected/` (gitignored) and are not in the app.

- ["1965 Ford Mustang Convertible"](https://sketchfab.com/3d-models/none-05f2a294087541ab82f681136d134344) by Kristian LaGrange, CC BY 4.0: paints everything from one texture, so paint and wheels can't be separated.
- ["Lamborghini Countach 5000QV"](https://sketchfab.com/3d-models/none-2f02b54e01fc428e8b19759c5970f882) by Randomness, CC BY 4.0: no colours or part names to work with.
- ["Rigged Car Mustang 1965 With Engine 3d model"](https://sketchfab.com/3d-models/none-c2d4f0a6170d43f4a5a8303373ebb81a) by Godspeed, CC BY 4.0: tried as a candidate.

`docs/sketchfab-cars.md` lists many more models and their authors as a survey; none of those is used unless it appears above.

## Font

- [Archivo](https://github.com/Omnibus-Type/Archivo) by Omnibus-Type (The Archivo Project Authors), via the npm package `@fontsource-variable/archivo`. [SIL Open Font License 1.1](https://openfontlicense.org).

## Libraries

All free and open source. Their licence texts ship in `node_modules/`.

| Library | Author | Licence |
| --- | --- | --- |
| [three.js](https://threejs.org) | mrdoob and contributors | MIT |
| [React](https://react.dev), React DOM | Meta and contributors | MIT |
| [React Three Fiber](https://github.com/pmndrs/react-three-fiber) | Paul Henschel and Poimandres | MIT |
| [drei](https://github.com/pmndrs/drei) | Poimandres | MIT |
| [zustand](https://github.com/pmndrs/zustand) | Paul Henschel and Poimandres | MIT |
| [three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) | Garrett Johnson | MIT |
| [Vite](https://vite.dev), @vitejs/plugin-react | Evan You and contributors | MIT |
| [TypeScript](https://www.typescriptlang.org) | Microsoft | Apache-2.0 |
| [glTF Transform](https://gltf-transform.dev) | Don McCurdy | MIT |
| [meshoptimizer](https://github.com/zeux/meshoptimizer) | Arseny Kapoulkine | MIT |
| [draco3dgltf](https://github.com/google/draco) | Google Draco team | Apache-2.0 |

## Services

- [Sketchfab](https://sketchfab.com) hosts the car models; its public API supplied the model titles, authors and licences above, and its Download API the files.

## Trademarks

Car makes and model names (Ferrari, Porsche, Toyota, Nissan, Mazda, Subaru, BMW, Mercedes-Benz, Volkswagen, Ford, Lamborghini, Honda and their model names), and the parts and wheel brands in `src/data/brands.ts`, `src/data/catalog.ts` and `src/data/wheels.ts` (BBS, RAYS / Volk Racing, Yokohama / Advan, HRE, Brembo, Garrett, Recaro and the rest), are trademarks of their respective owners. They are used only to identify the real cars and products. This project is not affiliated with or endorsed by any of them.

## Data accuracy

The car and parts data in `src/data/` is seed data written from memory, not researched from sellers or manuals. Prices, the sizes each wheel is sold in, factory offsets, engine figures, weights and paint swatch colours are approximate. Catalogue entries carry `verified: false` until checked. Wheels, engines and catalogue parts are stylised versions built from real dimensions, not measured copies.
