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

## Current work

- **BBS LM wheel prototype (`bbs-lm.html`):** a procedural Three.js wheel with a two-piece polished stepped lip, a ring of rivets, a deep dish, ten gold Y-shaped cross spokes that split near the rim, a centre hub with five lug nuts, and a tyre. All dimensions (diameter, width, spoke count, centre colour) are settings at the top of the file, and the wheel rebuilds from them. It's stylised, not millimetre-accurate.

## Known challenges

- Accurate 3D models of real cars and aftermarket parts are scarce and often licensed.
- Interior and engine-bay models are the hardest to find, so start with simplified versions there.
- AI image-to-3D tools (Meshy, Tripo) can help but often need clean-up, and Meshy costs credits.

## Working conventions

- Keep code modular: one module per part generator (wheels, tyres, brakes, etc.).
- Expose real-world specs (inches, millimetres, offsets) as parameters rather than hard-coded geometry.
- Keep parts data and 3D assets decoupled.
- When suggesting a tool or service, say whether it is free or paid.
