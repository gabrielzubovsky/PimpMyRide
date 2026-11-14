# Pimp My Ride

Pimp My Ride is a web-based 3D car configurator: a virtual garage for previewing real-world mods on a real car before buying them. You build a car and inspect it from shop-style views. It is a visualisation tool, not a driving game.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints in the terminal.

Other commands:

```bash
npm run build        # type-checks with tsc, then builds into dist/
npm run prepare:car  # re-creates public/models/ferrari-458-spider.glb
```

`npm run prepare:car` is only needed after changing `scripts/prepare-car.mjs`, or if `public/models/` is missing. It downloads the source model into `assets-src/` the first time it runs.

### Controls

- Drag to orbit around the car, scroll to zoom.
- Number keys 1 to 4 switch views: Exterior, Engine bay, Interior, Underside.
- In the Interior view, dragging looks around from the driver's seat instead of orbiting, and scrolling zooms the lens.

### Console handles (development builds only)

```js
garage.getState()                       // the current build and view
garage.setState({ rideFrontMm: -40 })   // change the build directly
three()                                 // live scene, camera and controls
```

## What works today

The first milestone is built:

- One car, labelled Ferrari 458 Spider.
- Four camera views (Exterior, Engine bay, Interior, Underside) with animated transitions.
- Paint colour and finish (gloss, metallic, satin, matte, chrome), plus a colour picker for any other colour.
- Procedural wheels with tyres and brakes, five wheel designs with several finishes each.
- Wheel and tyre size options.
- Adjustable ride height, front and rear together or separately.
- Brake caliper colour, window tint and interior leather colour.
- A build sheet that lists every choice and a rough parts total.

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | Page shell that Vite serves; loads `src/main.tsx`. |
| `scripts/prepare-car.mjs` | Turns the downloaded car model into the file the app loads. |
| `assets-src/` | Raw downloaded source model. Gitignored. |
| `public/models/ferrari-458-spider.glb` | Processed car model served to the browser. Not gitignored. |
| `src/main.tsx` | Entry point: loads the font and styles, mounts the React app. |
| `src/App.tsx` | Layout: the 3D canvas, view switcher, build sheet and keyboard shortcuts. |
| `src/units.ts` | Millimetre and inch to metre conversions. |
| `src/data/types.ts` | Types for parts data: cars, wheels, fitments, paints, camera views. |
| `src/data/cars.ts` | The car definition: dimensions, brakes, sizes, colours, mount names, views. |
| `src/data/wheels.ts` | Wheel catalogue: brand, design, finishes, sizes, price. |
| `src/data/paint.ts` | Paint finishes and their material settings. |
| `src/parts/lathe.ts` | Helper that spins a 2D profile into a round mesh. |
| `src/parts/wheel.ts` | Procedural wheel generator. |
| `src/parts/tyre.ts` | Procedural tyre generator. |
| `src/parts/brake.ts` | Procedural brake generator: disc, hat and caliper. |
| `src/scene/Garage.tsx` | The room: walls, floor, lights and reflections. |
| `src/scene/Car.tsx` | Loads the model, applies paint, glass and leather, positions the body. |
| `src/scene/Corners.tsx` | Builds and places the brake, wheel and tyre at each corner. |
| `src/scene/stance.ts` | Maths for where the wheels sit and how the body sits over them. |
| `src/scene/Lift.tsx` | In-ground lift that raises the car for the Underside view. |
| `src/scene/CameraRig.tsx` | Camera presets, limits and transitions. |
| `src/state/garage.ts` | Zustand store holding the current build and view. |
| `src/ui/BuildSheet.tsx` | The side panel for choosing parts, with the parts total. |
| `src/ui/ViewSwitcher.tsx` | The four view buttons. |
| `src/ui/format.ts` | Formats specs the way they are stamped on real parts. |
| `src/styles.css` | All page styles. |

## How it works

A few 3D terms used below:

- **Mesh:** a 3D shape made of triangles.
- **Material:** the settings that decide how a mesh's surface looks under light (colour, how metallic, how rough).
- **glTF / GLB:** the standard file format for 3D scenes. GLB is the single-file binary version.
- **Node:** an entry in a model's scene tree. It has a position, rotation and scale, and may or may not hold a mesh.
- **Mount (attachment point):** an empty node whose only job is to mark a position where a part should go.

### The car model pipeline

The source model has the stock wheels baked in. `scripts/prepare-car.mjs` uses glTF Transform (a free library for editing glTF files in code, so no Blender is needed) to make it usable:

1. Downloads the source GLB into `assets-src/` if it is not already there.
2. Reads the positions of the four stock wheel nodes, averages left and right (the model is slightly asymmetric), and creates four empty mount nodes: `mount_wheel_fl`, `mount_wheel_fr`, `mount_wheel_rl`, `mount_wheel_rr`.
3. Deletes the stock wheel nodes and everything under them, including their wheel, tyre and brake meshes. The app generates its own.
4. Renames the meshes the app drives from code, for example `body` becomes `body_paint` and `leather` becomes `interior_leather`.
5. Drops the source's Draco compression, prunes unused data (keeping the empty mounts), removes duplicates, and re-compresses with Meshopt. three.js decodes Meshopt without fetching an external decoder.
6. Writes `public/models/ferrari-458-spider.glb` and prints its size, bounds, wheelbase, track and mount positions.

At runtime `src/scene/Car.tsx` finds the mounts by name and puts its own materials on the meshes listed in the car's `nodes` field.

### Procedural parts

Wheels, tyres and brakes are generated in code from real specs. Inputs stay in their native units (inches for wheel size, millimetres for offset, tyre width and brake discs) and are converted to metres in `src/units.ts`.

- **Lathe** (`src/parts/lathe.ts`): takes a 2D outline (radius against height) and spins it around an axis, like turning metal on a lathe. Every round part is built this way. Unlike three.js's built-in `LatheGeometry`, it can keep sharp corners, so machined steps catch the light.
- **Wheel** (`src/parts/wheel.ts`): `buildWheel` takes diameter, width, offset, bolt count, PCD (pitch circle diameter, the circle the wheel bolts sit on) and a `WheelDesign`. The lip, barrel, hub and centre cap are lathed. Spokes are bars swept from hub to rim in one of three layouts: `straight`, `twin` or `split-y`. It returns one geometry per material slot (face, lip, barrel, hardware, cap) so finishes can colour them separately.
- **Tyre** (`src/parts/tyre.ts`): `buildTyre` works from the sidewall size. `235/35 R20` means 235 mm wide, sidewall 35% of the width, for a 20 inch rim. It has a rounded sidewall and a tread with four grooves.
- **Brake** (`src/parts/brake.ts`): `buildBrake` makes a disc, the hat that bolts it to the hub, and a caliper whose length depends on piston count.

All three share one axis convention: **Y is the axle, +Y is outboard** (the face you see from the side of the car). `src/scene/Corners.tsx` then turns each corner so the axle points out of the car, and mirrors the left side with a scale of -1.

### Stance

`src/scene/stance.ts` works out where the wheels sit and how the body sits over them.

**Offset (ET)** is the distance from the wheel's centreline to the face that bolts onto the car. A higher offset tucks the wheel further into the arch; a lower one pushes it out.

- **Hub position.** The hub does not move when you change wheels, so it is derived once: the factory wheel centreline (from the mount) plus the factory offset (`stockOffsetMm` in the car data).
- **New offset.** The wheel is placed so its centreline sits the new offset inboard of that hub face. Lowering the offset from 42 to 32 moves the wheel 10 mm outward.
- **Tyre size.** The axle height is the tyre's outer radius minus a small squash where it meets the ground. A taller tyre raises the axle, and the body with it.
- **Ride height.** The slider value is added on top. Negative is lower.
- **Rake.** The body's change in height is worked out separately for the front and rear axles. `bodyPose` turns the difference into a height and a nose-up or nose-down tilt, so lowering only the front, or fitting smaller front tyres, rakes the car forward.

The body eases toward its new pose each frame, so the sliders feel like suspension.

### Camera views

Camera presets live in the car's data (`views` in `src/data/cars.ts`), not in the camera code. Each preset sets a position, a target, a field of view, zoom limits and tilt limits. `src/scene/CameraRig.tsx` glides between presets and eases the field of view. The Interior view sets `lookAround`, which pivots the camera on the spot like turning your head. The Underside view sets `lift`, which raises the car on the in-ground lift in `src/scene/Lift.tsx`.

Reflections come from an **environment map**: an image of the surroundings that shiny materials reflect. `src/scene/Garage.tsx` builds one from glowing panels instead of loading a photo.

### Parts data

Parts data lives in `src/data/` and is plain data, separate from the 3D code. A wheel entry describes a real product; the generators in `src/parts/` turn its specs into meshes. This is the shape a parts database would serve later. Every catalogue entry has `verified: false` until its price and sizes have been checked against a seller.

## Recipes

### Add a wheel

Add an entry to `WHEELS` in `src/data/wheels.ts`. The fields that matter:

- `design`: the `WheelDesign` from `src/parts/wheel.ts`. This drives the 3D shape and the small drawing in the build sheet.
- `finishes`: at least one. Each sets a surface for face, lip, barrel and cap. The `metal`, `painted` and `allOver` helpers at the top of the file save typing.
- `fitments`: ids of the car's sizes this wheel is sold in, from `fitments` in `src/data/cars.ts`.
- `priceUsdEach`: price per wheel, or `null` for factory parts.
- `verified`: leave `false` until checked.

```ts
{
  id: 'example-seven',
  brand: 'Example',
  model: 'Seven-spoke',
  construction: 'Flow-formed one-piece',
  design: {
    spokes: 7,
    layout: { type: 'straight' },
    spokeWidthHubMm: 48,
    spokeWidthRimMm: 30,
    spokeDepthHubMm: 28,
    spokeDepthRimMm: 20,
    lipDepthMm: 20,
    steppedLip: false,
    rivets: 0,
    faceCurve: 1.4,
    hubDiameterMm: 168,
    capDiameterMm: 64,
  },
  finishes: [allOver('gloss-black', 'Gloss black', painted('#0b0b0c', 0.2))],
  fitments: ['stock', 'wide-20'],
  priceUsdEach: 900,
  verified: false,
},
```

### Add a paint colour

Add an entry to `paints` in `src/data/cars.ts`. `finish` must be one of the ids in `src/data/paint.ts`.

```ts
{ id: 'azzurro-california', name: 'Azzurro California', hex: '#7fa6c9', finish: 'metallic' },
```

To add a new finish, add it to `PAINT_FINISHES` in `src/data/paint.ts` and to the `PaintFinishId` type in `src/data/types.ts`.

### Add another car

1. Find a model whose wheels are separate nodes, ideally with the body, glass and interior as separate meshes too. Check the licence.
2. Write a prepare script based on `scripts/prepare-car.mjs`: change the source URL and paths, map the four wheel node names to mounts, and rename the meshes you want to drive from code.
3. Add a `CarDef` in `src/data/cars.ts` and include it in `CARS`. Fill in bolt pattern, factory offsets, brakes, sizes, colours, the node names, lift points and the four camera views.

The store in `src/state/garage.ts` currently uses the Ferrari directly, so a car picker is still to be built. Wheel `fitments` refer to one car's size ids, so those will need to become per-car as well.

## Known limitations

- **Model licence unverified.** The car model's licence could not be confirmed. It is fine as a placeholder for local prototyping, but must be confirmed or replaced before publishing, deploying, or pushing the processed model to a public repository. See [CREDITS.md](CREDITS.md).
- **Seed data.** Wheel prices, the sizes each wheel is sold in, the factory wheel offsets and paint swatch colours are approximate and from memory, not researched from sellers.
- **Stylised wheels.** The wheel designs are stylised versions of the real wheels, not measured copies.
- **No engine yet.** The model has nothing built under the engine cover, so the Engine bay view shows the cover itself. The view says so on screen.
- **Spider body, Italia title.** The source model is titled "Ferrari 458 Italia", but the mesh is the open-top Spider (no roof, twin buttresses behind the seats). The app labels it Ferrari 458 Spider.

## Next steps

From the roadmap in `CLAUDE.md`:

- Body kits and spoilers.
- Interior parts: seats, harnesses, steering wheels, trim materials.
- Engine bay parts, with a stats panel for claimed power, torque and weight changes.
- A real parts database with brands and fitment, filtered by the selected car.
