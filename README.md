# Pimp My Ride

Pimp My Ride is a web-based 3D car configurator: a virtual garage for previewing real-world mods on real cars before buying them. You pick a car, fit parts from a catalogue of real products, and inspect the result from shop-style views. It is a visualisation tool, not a driving game.

## Quick start

```bash
npm install
npm run dev
```

Open the URL Vite prints in the terminal.

```bash
npm run build        # type-checks with tsc, then builds into dist/
npm run typecheck    # type-check only
```

### Controls

- Drag to orbit around the car, scroll to zoom.
- Number keys 1 to 4 switch views: Exterior, Engine bay, Interior, Underside.
- In the Interior view, dragging looks around from the driver's seat instead of orbiting, and scrolling zooms the lens.
- Opening a line in the build sheet moves the camera to the view that suits it (seats and steering go inside, suspension goes underneath).

### Console handles (development builds only)

```js
garage.getState()                       // the current car, build and view
garage.setState({ rideFrontMm: -40 })   // change the build directly
three()                                 // live scene, camera and controls
```

## What works today

- **23 cars.** 12 have real 3D models: Ferrari 458 Spider, Porsche 911 Carrera 4S (992), Toyota Supra A80, Nissan Skyline GT-R R34, Mazda RX-7 FD, Subaru Impreza WRX STI GC8, BMW M3 E30, Mercedes 190E, Porsche 911 (964), VW Golf GTI Mk1, Ford Mustang '65 coupe and Lamborghini Countach 25th Anniversary. The 11 Honda Civic generations have no model yet and draw as a translucent outline sized from the real car's dimensions; everything else still works on them.
- **Four camera views** (Exterior, Engine bay, Interior, Underside) with animated transitions. Right-hand-drive cars (Supra, Skyline, Impreza) put the interior camera and driver-side parts on the right.
- **Paint** colour and finish (gloss, metallic, satin, matte, chrome), each car's factory colours plus a picker for any other colour.
- **Procedural wheels, tyres and brakes** built from real specs: 13 wheel designs with several finishes, per-car wheel and tyre sizes, adjustable ride height front and rear, caliper colour, window tint and leather colour.
- **A parts catalogue** of about 70 real products from about 110 real brands in 21 categories, each with a price, a fit note and any claimed power, torque or weight change. Most categories are drawn in 3D from published dimensions: GT wings, exhaust tips (with opening valves on valvetronic systems), coilovers and air ride, big-brake kits, body-kit stand-ins, carbon hoods, diffusers, nitrous bottles, roll cages, gauge pods, bucket seats, steering wheels, harnesses, intakes, turbos, superchargers, radiators, intercoolers, strut braces and engine covers.
- **Engine bays for every car.** Each car carries its real engine's specs (layout, cylinders, displacement, mounting, position, aspiration). The engine is generated from them, so a transverse Honda four, a twin-turbo inline six, a flat-six, a rotary and a V12 each look like what they are. In the Engine bay view the bonnet or deck lid is cut away.
- **A stats panel** comparing factory power, torque, weight and power-to-weight with the build's, using the makers' claimed figures.
- **A build sheet** that lists every choice and totals the price.

## Project layout

| Path | What it is |
| --- | --- |
| `src/main.tsx` | Entry point: loads the font and styles, mounts the React app. |
| `src/App.tsx` | Layout: the 3D canvas, view switcher, build sheet and keyboard shortcuts. |
| `src/units.ts` | Millimetre and inch to metre conversions. |
| `src/data/types.ts` | Types for cars, engines, wheels, fitments, paints and camera views. |
| `src/data/cars.ts` | The Ferrari and the 992, and the list of all cars. |
| `src/data/civics.ts` | All 11 Civic generations, plus shared helpers (camera presets, colour lists). |
| `src/data/more-cars.ts` | The ten survey cars, with their Sketchfab model credits. |
| `src/data/wheels.ts` | Wheel catalogue: brand, design, finishes, sizes, price. |
| `src/data/catalog.ts` | Parts catalogue: categories, products, prices, claims, and how to draw each part. |
| `src/data/brands.ts` | Registry of real brands the catalogue refers to. |
| `src/data/paint.ts` | Paint finishes and their material settings. |
| `src/parts/lathe.ts` | Spins a 2D profile into a round mesh. |
| `src/parts/wheel.ts`, `tyre.ts`, `brake.ts` | Procedural wheel, tyre and brake generators. |
| `src/parts/engine.ts` | Engine layout generator: sizes the block, heads, manifolds and turbo positions from the engine's specs. |
| `src/scene/Garage.tsx` | The room: walls, floor, lights and reflections. |
| `src/scene/Car.tsx` | Loads a model (or draws the outline), applies paint, glass and leather, and cuts the body open in the engine view. |
| `src/scene/Corners.tsx` | Builds and places the brake, wheel and tyre at each corner. |
| `src/scene/stance.ts` | Maths for where the wheels sit and how the body sits over them. |
| `src/scene/Mods.tsx` | 3D for catalogue parts on the body, in the cabin and under the car. |
| `src/scene/EngineBay.tsx` | The engine bay, the generated engine and the engine-bay parts. |
| `src/scene/ends.ts` | Where a car's nose and tail are. |
| `src/scene/Lift.tsx` | In-ground lift that raises the car for the Underside view. |
| `src/scene/CameraRig.tsx` | Camera presets, limits and transitions. |
| `src/state/garage.ts` | Zustand store holding the current car, build and view. |
| `src/ui/BuildSheet.tsx` | The side panel for choosing parts. |
| `src/ui/Stats.tsx` | Factory versus build figures. |
| `src/ui/ViewSwitcher.tsx` | The four view buttons. |
| `src/ui/format.ts` | Formats specs the way they are stamped on real parts. |
| `scripts/fetch-sketchfab.mjs` | Downloads car models through the Sketchfab API. |
| `scripts/inspect-glb.mjs` | Prints how a model is put together. |
| `scripts/prepare-sketchfab.mjs` | Turns a downloaded car model into the file the app loads. |
| `scripts/prepare-car.mjs`, `prepare-porsche.mjs` | Older hand-tuned versions for the 458 and the 992. |
| `public/models/` | Processed car models served to the browser. |
| `assets-src/` | Raw downloaded models. Gitignored. |
| `docs/sketchfab-cars.md` | Survey of about 800 downloadable CC-BY car models by marque. |
| `CREDITS.md` | Model licences and credits. |

## How it works

A few 3D terms used below:

- **Mesh:** a 3D shape made of triangles.
- **Material:** the settings that decide how a mesh's surface looks under light (colour, how metallic, how rough).
- **glTF / GLB:** the standard file format for 3D scenes. GLB is the single-file binary version.
- **Node:** an entry in a model's scene tree. It has a position, rotation and scale, and may or may not hold a mesh.
- **Primitive:** one part of a mesh drawn with one material. A mesh can hold several.
- **Mount (attachment point):** an empty node whose only job is to mark a position where a part should go.

### The car model pipeline

Car models come from Sketchfab, a site where artists share 3D models, many under Creative Commons licences. Each downloaded model has its own scale, orientation and naming, and has the stock wheels baked in. Three scripts turn one into something the app can use, with no Blender: they use glTF Transform, a free library for editing glTF files in code.

1. **Download.** `scripts/fetch-sketchfab.mjs` reads the Sketchfab link in each car's `credit` (in `src/data/more-cars.ts`), checks the licence and that the model is downloadable, and saves it as `assets-src/<car id>.glb`. It needs a free Sketchfab account's API token, kept in `.env.local` (gitignored, never commit it):

   ```
   SKETCHFAB_TOKEN=...
   ```

   ```bash
   node scripts/fetch-sketchfab.mjs                       # every car with a link
   node scripts/fetch-sketchfab.mjs bmw-m3-e30            # just these cars
   node scripts/fetch-sketchfab.mjs --model <uid> <name>  # any model, to try a candidate
   ```

2. **Inspect.** `scripts/inspect-glb.mjs` prints the model's node tree, or with `--materials` one line per material with where its parts sit. This is how you find which parts are the tyres, the paint and the glass, and which way the nose points.

   ```bash
   node scripts/inspect-glb.mjs assets-src/bmw-m3-e30.glb --materials
   ```

3. **Prepare.** `scripts/prepare-sketchfab.mjs` reads one config entry per car (nose direction, the real wheelbase, and which parts are tyres, wheels, paint, glass and leather, picked by node name or by material-name pattern) and then:
   - finds the four wheel centres by splitting the tyre vertices into corners, which works even when all four tyres are one mesh;
   - straightens models that sit a fraction of a degree off, using the axle lines;
   - scales the model so its wheelbase matches the real car's, turns the nose to -z, puts the tyres on the ground and centres the model between its axles;
   - deletes the baked wheels, tyres and brakes (the app makes its own), plus any baked engine;
   - renames the paint, glass and leather materials to `paint`, `glass` and `leather`, which is how the app finds them;
   - gives untextured parts sensible colours where a model arrives without its textures;
   - adds the four `mount_wheel_*` nodes and recompresses with Meshopt into `public/models/<car id>.glb`.

   ```bash
   node scripts/prepare-sketchfab.mjs bmw-m3-e30
   node scripts/prepare-sketchfab.mjs --all
   ```

   It prints the model's size (compare it with the real car), the mount positions and the body's `ends`, the z of the nose and tail. The car's entry in `more-cars.ts` then gets `prepared: { ends: [...] }` (plus `leather: true` or `glass: false` where needed), which switches it from an outline to the model.

At runtime `src/scene/Car.tsx` finds the mounts by name and puts its own materials on any mesh or material named in the car's `nodes` field.

### Procedural parts

Wheels, tyres and brakes are generated in code from real specs. Inputs stay in their native units (inches for wheel size, millimetres for offset, tyre width and brake discs) and are converted to metres in `src/units.ts`.

- **Lathe** (`src/parts/lathe.ts`): takes a 2D outline (radius against height) and spins it around an axis, like turning metal on a lathe. Every round part is built this way. Unlike three.js's built-in `LatheGeometry`, it can keep sharp corners, so machined steps catch the light.
- **Wheel** (`src/parts/wheel.ts`): `buildWheel` takes diameter, width, offset, bolt count, PCD (pitch circle diameter, the circle the wheel bolts sit on) and a `WheelDesign`. The lip, barrel, hub and centre cap are lathed. Spokes are bars swept from hub to rim in one of three layouts: `straight`, `twin` or `split-y`. It returns one geometry per material slot (face, lip, barrel, hardware, cap) so finishes can colour them separately.
- **Tyre** (`src/parts/tyre.ts`): `buildTyre` works from the sidewall size. `235/35 R20` means 235 mm wide, sidewall 35% of the width, for a 20 inch rim.
- **Brake** (`src/parts/brake.ts`): `buildBrake` makes a disc, the hat that bolts it to the hub, and a caliper whose length depends on piston count.

All three share one axis convention: **Y is the axle, +Y is outboard** (the face you see from the side of the car). `src/scene/Corners.tsx` turns each corner so the axle points out of the car, and mirrors the left side with a scale of -1.

Catalogue parts (`src/scene/Mods.tsx`) are built the same way from the dimensions in their catalogue entry: a wing from its span, chord and height, exhaust tips from their diameter and layout, gauge pods from their count and size. They are positioned from the car's real dimensions, so the same part fits every car.

### Engine bays

Each car has an `engine` entry with the engine's real specs. `src/parts/engine.ts` works out the bore from the displacement (assuming bore equals stroke), and from that the cylinder spacing, block length, deck height and head size. It then places the banks (one upright for an inline engine, two at the bank angle for a V, two lying flat for a boxer, stacked rotor housings for a rotary), the intake plenum, the exhaust ports and where turbos can hang.

`src/scene/EngineBay.tsx` draws the bay around it: painted inner wings, strut towers, firewall, battery, brake booster and radiator for a front-engined car, or a tub behind the cabin for a mid- or rear-engined one. A transverse engine is turned across the car. Intakes, turbos, superchargers, radiators, intercoolers, strut braces and engine covers from the catalogue are drawn in their places. In the Engine bay view, clipping planes cut away the body above and over the bay, as if the bonnet or deck lid had been lifted off.

### Stance

`src/scene/stance.ts` works out where the wheels sit and how the body sits over them.

**Offset (ET)** is the distance from the wheel's centreline to the face that bolts onto the car. A higher offset tucks the wheel further into the arch; a lower one pushes it out.

- **Hub position.** The hub does not move when you change wheels, so it is derived once: the factory wheel centreline (from the mount) plus the factory offset (`stockOffsetMm` in the car data).
- **New offset.** The wheel is placed so its centreline sits the new offset inboard of that hub face. Lowering the offset from 42 to 32 moves the wheel 10 mm outward.
- **Tyre size.** The axle height is the tyre's outer radius minus a small squash where it meets the ground. A taller tyre raises the axle, and the body with it.
- **Ride height.** The slider value is added on top. Negative is lower.
- **Rake.** The body's change in height is worked out separately for each axle and turned into a height and a nose-up or nose-down tilt.

The body eases toward its new pose each frame, so the sliders feel like suspension.

### Camera views

Camera presets live in the car's data (`views`), not in the camera code; `viewsFor` in `src/data/civics.ts` sizes them from a car's dimensions. `src/scene/CameraRig.tsx` glides between presets. The Interior view sets `lookAround`, which pivots the camera on the spot like turning your head. The Underside view sets `lift`, which raises the car on the lift in `src/scene/Lift.tsx`.

Reflections come from an **environment map**: an image of the surroundings that shiny materials reflect. `src/scene/Garage.tsx` builds one from glowing panels instead of loading a photo.

### Parts data

Parts data lives in `src/data/` and is plain data, separate from the 3D code: the shape a parts database would serve later. A part can exist in the catalogue before it has any 3D; the build sheet then says "Not drawn in 3D yet". Every entry has `verified: false` until its price and specs have been checked against a seller.

## Recipes

### Add a car with a model

1. Find a model on Sketchfab (start with `docs/sketchfab-cars.md`). Check the licence: CC Attribution is easiest. Prefer models whose parts and materials have meaningful names, and avoid ones that paint everything from a single texture, since the paint and wheels can't be separated.
2. Add the car's data to `MORE_CARS` in `src/data/more-cars.ts`: dimensions, engine, weight, bolt pattern, offsets, brakes, wheel sizes and colours. Put the Sketchfab link in `credit`. Without a model it already works as an outline.
3. Download and inspect it:

   ```bash
   node scripts/fetch-sketchfab.mjs <car id>
   node scripts/inspect-glb.mjs assets-src/<car id>.glb --materials
   ```

4. Add a config entry for it to `CARS` in `scripts/prepare-sketchfab.mjs` and run the script. Check the printed size against the real car.
5. Add `prepared: { ends: [...] }` with the printed ends. If the steering wheel is on the right, add `rhd: true`. If the interior camera lands inside a seat, set `eye`.
6. Look at it in all four views, and add its credit to `CREDITS.md`.

### Add a catalogue part

Add an entry to `CATALOG` in `src/data/catalog.ts`: category, brand (from `src/data/brands.ts`), model, a one-line blurb, price, fit and any `claims` (`hp`, `nm`, `kg`). Give it a `cars` list if it is made for specific cars. If its category already has a `render` kind, fill one in and it is drawn straight away; otherwise it appears in the build sheet without 3D until a renderer exists.

### Add a wheel

Add an entry to `WHEELS` in `src/data/wheels.ts` with a `design` (the `WheelDesign` from `src/parts/wheel.ts`, which drives the 3D shape and the drawing in the build sheet), at least one finish, the fitment ids it is sold in, and a price per wheel.

### Add a paint colour

Add an entry to the car's `paints` list. `finish` must be one of the ids in `src/data/paint.ts`.

## Known limitations

- **Model licences.** The 458 model's licence could not be confirmed, and the Skyline, RX-7 and 964 models look like re-uploaded video-game assets. They are fine as placeholders for local prototyping, but must be replaced or confirmed before publishing, deploying, or pushing the processed models to a public repository. See [CREDITS.md](CREDITS.md).
- **Seed data.** Prices, sizes, offsets, engine figures, weights and paint swatches are approximate and from memory, not checked against sellers or manuals.
- **Stylised parts.** Wheels, engines and catalogue parts are built from real dimensions but are stand-ins, not measured copies. Body kits and seats really need sourced models.
- **Model quirks.** The RX-7's front bumper intakes render as solid black blocks (its see-through grille textures are missing). The Golf model's own tyres were oversize, so the real-size garage tyres leave a little room in the arches. The Mustang model has no window glass. The 992 model has no interior.
- **Civics.** No Civic model has been picked yet, so all 11 generations are outlines.
- **Fitment.** The catalogue is not yet filtered by the selected car; parts made for other cars just carry a note.

## Next steps

From the roadmap in `CLAUDE.md`:

- Pick and prepare a model for each Civic generation.
- Replace the models with doubtful licences.
- Filter the catalogue by the selected car, and move the parts data into a real database.
- Check the approximate figures against real sources.
