# CLAUDE.md — Pimp My Ride

## Project overview

Pimp My Ride is a web-based 3D car configurator, a virtual garage for previewing real-world mods on real cars before buying them. It is a visualisation tool, not a driving game: the user builds and reviews a car, they don't drive it.

The goal is to let the user modify anything on a car that can be modified in real life (exterior, interior, engine bay, suspension, brakes) and inspect the result from shop-style views, as if working on the car in a garage.

## About the developer

- CS student, comfortable with coding in general.
- New to 3D work. Explain 3D concepts (meshes, materials, glTF, UVs, transforms) clearly and don't assume Blender knowledge.
- Prefers to avoid Blender for now. Favour code-based or script-based solutions, and only suggest Blender when it is genuinely unavoidable.
- Prefers free tools. Meshy (image/text to 3D) was considered but is paid, so don't rely on paid services without flagging the cost.

## Tech stack

- **Rendering:** Three.js, via React Three Fiber for the full app
- **Helpers:** @react-three/drei (OrbitControls, environment lighting, GLTF loading, camera helpers)
- **Model format:** glTF / GLB
- **Model processing without Blender:** glTF Transform (renaming, restructuring and optimising model parts in scripts)
- **Data:** a parts database (e.g. Postgres or Supabase) for brands, specs, prices and fitment
- **Standalone prototypes:** single-file HTML pages that load Three.js from a CDN

## Core design decisions

1. **Real cars and real parts.** Parts data (brands, part names, specs, prices, vehicle fitment) is researched from the web and stored separately from 3D assets. A part can exist in the catalogue before it has a detailed 3D model.
2. **Modular car models.** Each car is split into named, swappable meshes (wheels, tyres, brakes, seats, steering wheel, dashboard, hood, bumpers, engine components). Prefer source models from Sketchfab that already come split into parts. Always check licences.
3. **Procedural parts where possible.** Wheels are generated in code from real specs (diameter, width, offset, spoke count and style, lip, centre cap) rather than modelled by hand. Round, repeating parts suit this approach well.
4. **Shop-style camera views.** Camera presets for Exterior, Engine Bay, Interior and Underside, with smooth animated transitions between them.
5. **Start small.** One car and a few mod categories first, then expand.

## Roadmap

1. **Foundation:** load one car, orbit controls, lighting, camera presets and transitions.
2. **Modular structure:** named parts and attachment points so replacements snap into place.
3. **Exterior:** paint and finishes (gloss, matte, satin, metallic, chrome, wraps), procedural wheels, tyres, brakes, ride height, body kits, spoilers, lighting, tint.
4. **Interior:** seats, harnesses, steering wheels, shift knobs, pedals, trim materials (leather, Alcantara, carbon fibre), gauges, screens, roll cages, audio.
5. **Engine bay and performance:** intakes, turbos and superchargers, intercoolers, exhausts, strut braces, engine covers, plus a stats panel showing claimed horsepower, torque and weight changes from parts data.
6. **Parts database:** real brands and fitment, filtered by the selected car.

**First milestone:** one car, four camera views, paint changes, procedural wheels and adjustable ride height.

## Current state (November 2026)

The app is a Vite + React Three Fiber garage (`src/`), well past the first milestone.

- **Cars (23 selectable, `src/data/cars.ts` / `civics.ts` / `more-cars.ts`):** 12 have real GLB models in `public/models/`: Ferrari 458 Spider, Porsche 992, and all ten survey picks (Supra A80, Skyline R34, RX-7 FD, Impreza GC8, M3 E30, 190E, 911 964, Golf GTI Mk1, Mustang '65 coupe, Countach 25th Anniversary). The 11 Honda Civic generations have no model picked yet and draw as a translucent outline sized from real dimensions (`modelUrl: null`). `rhd: true` marks right-hand-drive models (Supra, Skyline, Impreza); `eye` overrides the interior camera when a model's seats sit off the default; `bodyEndsZ` gives a model's measured nose/tail z (overhangs differ front to rear; `src/scene/ends.ts` falls back to ±length/2). **Licences:** the Skyline, RX-7 and 964 models look like re-uploaded game assets; see `CREDITS.md` — local prototyping only until replaced.
- **Model pipeline (`scripts/`):** `fetch-sketchfab.mjs` downloads models through the free Sketchfab Download API (token in git-ignored `.env.local` as `SKETCHFAB_TOKEN`; never print or commit it); with no args it fetches every car whose credit has a link, `--model <uid> <name>` fetches a candidate. `inspect-glb.mjs <file> [--materials]` prints a model's node tree or a per-material summary. `prepare-sketchfab.mjs <car id | --all>` is config-driven (per car: nose direction incl. ±x, real wheelbase, and parts picked by node name or `{ mat: regex }`): it measures wheel centres from tyre vertices (merged tyres fine), straightens slightly yawed models, scales to the real wheelbase, turns the nose to -z, centres the axles on z = 0, strips baked wheels/brakes/engines, renames paint/glass/leather *materials* to `paint`/`glass`/`leather` (the garage matches mesh or material names), recolours untextured trim (`colors`, with presets for game-style TNR models), plants `mount_wheel_*`, converts spec-gloss materials and recompresses with Meshopt. It prints `ends` to paste into the car's `prepared: { ends, leather?, glass? }` in `more-cars.ts`. Rejected downloads live in `assets-src/rejected/`. The older `prepare-car.mjs` / `prepare-porsche.mjs` are hand-tuned for the 458 and 992. Licences and credits live in `CREDITS.md`; each car's `modelCredit` (title, author, links, licence, changes, `unconfirmed` reason) is also shown in the app, under the car name and in the build sheet (`src/ui/ModelCredit.tsx`), as CC BY asks. Credit every model used or downloaded.
- **Parts data (`src/data/`):** `brands.ts` (~110 real brands), `catalog.ts` (~70 real parts in 21 categories with prices, fit notes, claimed hp/Nm/kg, all `verified: false`; a part's optional `cars` list decides its fit per car via `fitFor`), `wheels.ts` (13 wheel designs driving the procedural generator). Exhausts carry a system type (cat-back, axle-back, valvetronic, straight-pipe); valvetronic ones get a valves-open toggle.
- **Procedural part renders (`src/scene/Mods.tsx`):** built from published dimensions — GT wings, exhaust tips with valve flaps, coilovers/air ride, big-brake kits, nitrous bottles, roll cage, gauge pods, bucket seats, steering wheels (the 458's factory wheel mesh hides via `nodes.steering`), harnesses, body-kit stand-ins (over-fenders, lip, skirts, diffuser), carbon hood and rear diffuser.
- **Engine bays (`src/parts/engine.ts`, `src/scene/EngineBay.tsx`):** every car has an `EngineSpec` (layout inline/V/flat/rotary, cylinders, displacement, mounting, position, aspiration, factory hp and torque, cover colour) and a `weightKg`. `engineLayout()` sizes block, heads, plenum, exhaust ports and turbo spots from bore (square engine assumed); the scene draws it in a front bay (painted inner wings, strut towers, firewall, battery, booster, radiator) or a rear tub. Model cars give `CarDef.engineBay` (crank centre, clip limits, width); outline cars derive it from `sizeM`. In the engine view clipping planes cut the bonnet/deck away. Intakes, turbos, superchargers, radiator, FMIC, strut braces (2- and 3-point, on risers that clear the engine) and carbon engine covers from the catalogue draw in the bay.
- **Build sheet (`src/ui/BuildSheet.tsx`):** car picker, paint/wheels/size/ride/calipers/tint/leather lines plus one generic line per catalogue category; the footer totals prices, and `src/ui/Stats.tsx` shows factory power, torque, weight and power-to-weight next to the build's (factory figures plus claims). Parts without geometry say "Not drawn in 3D yet."
- **Next obvious steps:** pick a Civic model per generation (search the Sketchfab API, fetch with `--model`, inspect, prepare); replace the three doubtful-licence models; the RX-7 front bumper intakes render as solid black blocks (missing see-through grille textures); sourced models for seats and body kits (also needs Sketchfab); filter the catalogue by the selected car using `cars` lists (roadmap step 6); check the `approx` figures against real sources.
- The old single-file `bbs-lm.html` prototype is superseded by `src/parts/wheel.ts`.

## Known challenges

- Accurate 3D models of real cars and aftermarket parts are scarce and often licensed.
- Interior and engine-bay models are the hardest to find, so start with simplified versions there.
- AI image-to-3D tools (Meshy, Tripo) can help but often need clean-up, and Meshy costs credits.

## Working conventions

- Keep code modular: one module per part generator (wheels, tyres, brakes, etc.).
- Expose real-world specs (inches, millimetres, offsets) as parameters rather than hard-coded geometry.
- Keep parts data and 3D assets decoupled.
- When suggesting a tool or service, say whether it is free or paid.
