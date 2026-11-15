# Sketchfab car model survey

Survey of downloadable car models on Sketchfab, run against the public search
API (`api.sketchfab.com/v3/search`, `downloadable=true`) on 2026-11-14.
59 searches across the marques below returned 1,342 results; after filtering to
real production road cars with a Creative Commons licence and a face count
between 15k and 700k, roughly 800 unique CC-BY models and ~490 CC-BY-NC/SA
models remained. The tables keep the best two or three per car.

How to read the tables:

- **Licence**: `CC-BY` (free to use with credit) is preferred. `CC-BY-NC-SA`
  rows are flagged — non-commercial + share-alike, fine for a personal
  project but a problem if this ever ships commercially.
- **Pick**: `PICK` marks the candidate implemented as a `CarDef` in
  `src/data/more-cars.ts`. `alt` is a fallback.
- Downloading needs a (free) logged-in Sketchfab account; the viewer URLs
  below are the download pages. Face counts are as reported by the API.
- Caveat: search metadata can't confirm whether a model has a full interior
  or separated parts — check in the viewer before committing to one.

## Toyota

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Toyota Supra MK IV (1994) | A80 | CC-BY | Martin Trafas | 261,968 | PICK | https://sketchfab.com/3d-models/none-eb9bb1eb41db431cb078088ae1ce45f8 |
| Toyota Supra Mk4 Supra 1997 | A80 | CC-BY | Jean Wally's | 200,862 | alt | https://sketchfab.com/3d-models/none-53eada7b8103489caa6fe5dd43f27cee |
| 2020 Toyota GR Supra | A90 | CC-BY | 007 | 239,520 | | https://sketchfab.com/3d-models/none-7ff658882f8a40468efdb1d389f184b4 |
| Toyota GT Apex Trueno (AE86) Stock JDM | AE86 | CC-BY | Raain86 | 86,513 | | https://sketchfab.com/3d-models/none-552435085b5a4e20a0e89150c3c0f292 |
| Toyota AE86 Corolla | AE86 | CC-BY | Socksthecat | 162,998 | | https://sketchfab.com/3d-models/none-a97492fa1d4741b5bcc17e94b2b6556f |
| Toyota GT86 | ZN6 | CC-BY | Nieve5677 | 70,016 | | https://sketchfab.com/3d-models/none-f02c802c32994b2784fa182a9ed71f84 |
| 1976 Toyota Land Cruiser FJ40 | FJ40 | CC-BY | tonielpro520 | 177,769 | | https://sketchfab.com/3d-models/none-a4e58b09ce48444ca6164834c310880d |

Hilux coverage is thin: mostly low-poly game-style trucks or single parts;
the best full truck found was the Hilux Champ (262,897 faces, CC-BY).

## Nissan

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| 02' Nissan Skyline R34 GT-R | R34 | CC-BY | DRIVER-FIRE | 227,785 | PICK | https://sketchfab.com/3d-models/none-14bee030e5d847b7ad16be3a28459222 |
| Nissan Skyline R34 GTR 2002 | R34 | CC-BY | vecarz | 227,038 | alt | https://sketchfab.com/3d-models/none-03907515f2e24316b6fefa3ebdd4dd0a |
| Nissan Skyline GT-R R32 | R32 | CC-BY | S.K. | 59,272 | | https://sketchfab.com/3d-models/none-b51584c58ab34f31a8c901a79b7ef65b |
| Nissan GTR R35 Nismo | R35 | CC-BY | DRIVER-FIRE | 170,703 | | https://sketchfab.com/3d-models/none-3ada6685647f46d99f53e3d41251d2d4 |
| Nissan 350Z Nismo (Z33) | Z33 | CC-BY | Mona x Supercars | 68,071 | | https://sketchfab.com/3d-models/none-c7630b11520a45439261cace826a93f0 |
| Nissan 370z | Z34 | CC-BY | Kajb | 68,142 | | https://sketchfab.com/3d-models/none-ccacfebd01744d318deb776f48133c24 |
| 1992 Nissan Silvia S13 | S13 | CC-BY | bagged_ls | 54,140 | | https://sketchfab.com/3d-models/none-6fa8f1948f954e3b980b5e96f203815a |

S13/S14 coverage is weak: lots of single bumpers, photogrammetry scans and
game rips, few clean full cars. The S13 above is the best stock-looking one.

## Mazda

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| 1993 Mazda RX-7 | FD3S | CC-BY | 007 | 203,266 | PICK | https://sketchfab.com/3d-models/none-8b828b5c888c43a1895228d48fe50c97 |
| 2002 Mazda RX-7 Spirit R (FD) | FD3S | CC-BY | Galaxy Car Showroom | 56,574 | alt | https://sketchfab.com/3d-models/none-5d3422f5a933442b94fd85b97dd97aab |
| Mazda RX-7 FC3S ("Akagi's White Comet") | FC3S | CC-BY | Myedsu | 146,009 | | https://sketchfab.com/3d-models/none-de2dd3c49fc8467aa8af0ec934a40c15 |
| 1989 Mazda Miata MX-5 (NA) | NA | CC-BY | amogusstrikesback2 | 72,914 | | https://sketchfab.com/3d-models/none-2f14a85e4a80433ebf3d0a15467fe691 |
| Mazda Miata MX-5 NA | NA | CC-BY | Lexyc16 | 52,340 | | https://sketchfab.com/3d-models/none-d51fcd44b74f4daf8012c41e0400c041 |
| 2016 Mazda MX-5 Miata | ND | CC-BY | Galaxy Car Showroom | 57,064 | | https://sketchfab.com/3d-models/none-922ff6fec90340ed8cf5aabe38dd1ad2 |

RX-8 coverage is poor: the clean ones are CC-BY-NC-SA widebody kits
(Ddiaz Design) or very low poly.

## Honda (beyond the Civics already in the garage)

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Honda S2000 | AP1/AP2 | CC-BY | DRIVER-FIRE | 217,372 | | https://sketchfab.com/3d-models/none-c8f87ba8790d4154929103e4012d1e66 |
| 1999 Honda S2000 AP1 | AP1 | CC-BY | mc010699 | 253,658 | | https://sketchfab.com/3d-models/none-737fd0a261fd4f32b431c838dcc57c0f |
| Honda NSX 1990 | NA1 | CC-BY | Lexyc16 | 101,006 | | https://sketchfab.com/3d-models/none-1cc15628a00a4739a6b6c01128927c8d |
| 1998 Honda Integra Type R DC2 | DC2 | CC-BY | 007 | 144,245 | | https://sketchfab.com/3d-models/none-d4a40c0f29e64138874e74d8559e71cd |

Good coverage, but Honda already has eleven Civics in the garage, so none of
these made the first ten.

## Subaru / Mitsubishi

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Subaru Impreza WRX STi Version VI (GC8) | GC8 | CC-BY | Mona x Supercars | 155,652 | PICK | https://sketchfab.com/3d-models/none-457f01e7e8d14b088e3f092c1be9e75c |
| 2010 Subaru Impreza WRX STi | GR | CC-BY | Galaxy Car Showroom | 49,769 | alt | https://sketchfab.com/3d-models/none-b61292f5b9d2416990aa5bd502555f3a |
| Subaru BRZ (ZC6) | ZC6 | CC-BY | Mona x Supercars | 148,158 | | https://sketchfab.com/3d-models/none-321a9ece66bb4616872892c01d279542 |
| Mitsubishi Lancer Evolution IX | CT9A | CC-BY | Benit Kibabu | 163,361 | | https://sketchfab.com/3d-models/none-ee88ad9414884bdabaf0658943ac339b |
| Mitsubishi Lancer Evolution 6 | CP9A | CC-BY | vecarz | 80,904 | | https://sketchfab.com/3d-models/none-c3d5dcd8ff724bc88c46760d92fc5188 |

## BMW

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| [FREE] BMW M3 E30 | E30 | CC-BY | Martin Trafas | 117,261 | PICK | https://sketchfab.com/3d-models/none-ac3c7013434e403e8faff87948caf422 |
| 1991 BMW M3 (E30) | E30 | CC-BY | DisneyCars | 161,633 | alt | https://sketchfab.com/3d-models/none-a87016d8b1314b0b817977de0645a55a |
| BMW E36 M3 | E36 | CC-BY | Martin Trafas | 67,390 | | https://sketchfab.com/3d-models/none-762b90efd3dc413cb61c3e3c8097b8ac |
| BMW M3 E46 | E46 | CC-BY | Fratzica | 157,195 | | https://sketchfab.com/3d-models/none-325f74ef4f44457fad28f66fcbb7b32f |
| BMW M4 CS G82 2021 | G82 | CC-BY | eldaaar | 275,927 | | https://sketchfab.com/3d-models/none-a05107b16891426c98d0ab4b271acf03 |

Strong coverage; many E30/E46 hits are DTM or GTR race cars, excluded here.

## Mercedes-Benz

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| 1984 Mercedes 190E | W201 | CC-BY | Dave Love SketchFab | 185,752 | PICK | https://sketchfab.com/3d-models/none-dc0799500bc4478296514b25a6541282 |
| Mercedes 190E EVO 1982 | W201 | CC-BY | Betier Models | 178,555 | alt | https://sketchfab.com/3d-models/none-15e5576f4b724f2db357165caed3492b |
| 2021 Mercedes-AMG GT Black Series | C190 | CC-BY | DisneyCars | 158,161 | | https://sketchfab.com/3d-models/none-5b62f77d732041a68784d13026ce7a16 |
| Mercedes-Benz AMG GT-R (2017) | C190 | CC-BY | SimonStrikesBack | 114,698 | | https://sketchfab.com/3d-models/none-2c21b97ff3dc4fc3b1ef9e4bb0164318 |

## Audi

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Audi RS6 Avant (2020) | C8 | CC-BY | yann35561 | 233,970 | | https://sketchfab.com/3d-models/none-6d4913db79554d89b6cc488aca6b6bbc |
| Audi R8 Spyder | 4S | CC-BY | DRIVER-FIRE | 224,248 | | https://sketchfab.com/3d-models/none-de0810b55c154ac3a3bb2972d043edb6 |
| Audi R8 | Typ 42 | CC-BY | jasonjliang | 51,866 | | https://sketchfab.com/3d-models/none-57c798d774004b38a1a08f62f9c76651 |

Decent coverage. Not picked for the first ten, purely to keep variety.

## Porsche

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| 1989 Porsche 911 (964) Carrera 4 | 964 | CC-BY | 007 | 299,363 | PICK | https://sketchfab.com/3d-models/none-22edb81d9ccf46c09a1add7a9ebda2c0 |
| 1992 Porsche 911 964 Turbo S 3.6 | 964 | CC-BY | Maroi Mister | 93,629 | alt | https://sketchfab.com/3d-models/none-b868c5883b9c4ff889bc7f439e01cd7e |
| [FREE] Porsche 911 RWB (993) | 993 | CC-BY | GORDEYKOMARK | 125,275 | | https://sketchfab.com/3d-models/none-523206619f5f4234aea72dc9305bb11a |
| Porsche 911 GT3 | 991 | CC-BY | ChevroletSS | 239,145 | | https://sketchfab.com/3d-models/none-78d5c47ab2554c2592b7e499179a0792 |
| 2014 Porsche Cayman S (981) | 981 | CC-BY | 007 | 79,638 | | https://sketchfab.com/3d-models/none-e70bf68b80124cf888e5995ea8a36804 |

993s skew heavily RWB (modified); stock 993 road cars are scarce.

## Volkswagen

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Volkswagen Golf GTI 1976 | Mk1 | CC-BY | geevisual55 | 58,296 | PICK | https://sketchfab.com/3d-models/none-4ab00bf79f2b413c8e89fb7ff5470249 |
| 2025 Volkswagen Golf GTI Mk8.5 | Mk8.5 | CC-BY | BMW'S Lost Proxy | 550,086 | alt | https://sketchfab.com/3d-models/none-de98fb98417547f4904fa24d6be3b269 |
| 2014 Volkswagen Golf GTI Mk7 | Mk7 | CC-BY-NC-SA (flag) | Ddiaz Design | 98,695 | | https://sketchfab.com/3d-models/none-93f2b79c56c14b269fbe914205c4712e |
| 1968 Volkswagen Beetle | Type 1 | CC-BY | 007 | 84,531 | | https://sketchfab.com/3d-models/none-2b12ca5adba84b48ac151a5c76dbf594 |
| Classic Volkswagen Beetle | Type 1 | CC-BY | ISAACLAB | 100,240 | | https://sketchfab.com/3d-models/none-d3098f6b55384d0fb452ce752762c8a4 |

GTI coverage is patchy in the middle generations: Mk5/Mk6 hits were mostly
low poly or NC-licensed.

## Ford

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| 1965 Ford Mustang Convertible | 1st gen | CC-BY | Kristian LaGrange | 111,817 | PICK | https://sketchfab.com/3d-models/none-05f2a294087541ab82f681136d134344 |
| Ford Mustang Shelby 2012 | S197 | CC-BY | David_Holiday | 183,156 | alt | https://sketchfab.com/3d-models/none-b60b3a520c024fd69416d56a71900626 |
| Ford GT 2016 (FREE) | 2nd gen GT | CC-BY | JUSTGAME | 129,826 | | https://sketchfab.com/3d-models/none-b832b7b228714df285884e8e5d711540 |
| 2009 Ford Focus RS | Mk2 | CC-BY | 007 | 187,374 | | https://sketchfab.com/3d-models/none-737b0a0dab0d4d81a3cf37b4bd6b7880 |
| 2016 Ford Focus RS | Mk3 | CC-BY | Galaxy Car Showroom | 54,807 | | https://sketchfab.com/3d-models/none-0be475f4d68640b194405a8782956d9c |

Note the picked Mustang is the convertible body; a fastback would suit a mod
platform better if one turns up.

## Chevrolet / Dodge

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Chevrolet Corvette C7 Z06 | C7 | CC-BY | Randomness | 154,077 | | https://sketchfab.com/3d-models/none-3648a2668d5049d2a15e84facb150562 |
| 1970 Chevrolet Camaro | 2nd gen | CC-BY | DisneyCars | 136,358 | | https://sketchfab.com/3d-models/none-789b0af67d994306b967facf75ab2e01 |
| 2017 Chevrolet Camaro ZL1 | 6th gen | CC-BY | Ddiaz Design | 166,670 | | https://sketchfab.com/3d-models/none-c57c5b0ff3e347c5aa40795a23e22187 |
| ( FREE ) Dodge Challenger SRT | LC | CC-BY | SDC PERFORMANCE | 114,022 | | https://sketchfab.com/3d-models/none-38a1fd572beb433fa2d26d8c1070c8fa |
| Dodge Charger 1969 | B-body | CC-BY | Ilya_1392 | 138,079 | | https://sketchfab.com/3d-models/none-5d0a26841d5145289b72b7198469d872 |

Good coverage all round; left out of the first ten for marque variety only
(one American pick, the Mustang, made the cut).

## Lamborghini / Ferrari / McLaren / Lotus / Aston Martin

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| Lamborghini Countach 5000QV | 5000 QV | CC-BY | Randomness | 175,061 | PICK | https://sketchfab.com/3d-models/none-2f02b54e01fc428e8b19759c5970f882 |
| 1988 Lamborghini Countach | 25th Anniv. | CC-BY | Dave Love SketchFab | 203,056 | alt | https://sketchfab.com/3d-models/none-6ecbd718252143b1a83875357d003592 |
| Lamborghini Aventador LP700 | LP700-4 | CC-BY | David_Holiday | 188,836 | | https://sketchfab.com/3d-models/none-67796ac0bfa54c5cbe34dffc9847264d |
| 1987 Ferrari F40 | F40 | CC-BY | Ddiaz Design | 145,903 | | https://sketchfab.com/3d-models/none-80b0cdeb364b4223a006f3be12f16dc4 |
| 2018 Ferrari 488 Pista | 488 | CC-BY | Maroi Mister | 175,551 | | https://sketchfab.com/3d-models/none-88553964262c439f8b7774b4ae48ec71 |
| 2017 McLaren 720S | 720S | CC-BY | Ddiaz Design | 222,809 | | https://sketchfab.com/3d-models/none-738727995dd7489086975659fe852637 |

Honest gaps: Ferrari F355 has essentially nothing usable (one NC-SA model);
stock Huracans are mostly race GT3s or NC-licensed tuner kits; Lotus Elise
results were noisy (race GT1s, million-face sculpts, off-topic parts); Aston
Martin Vantage hits skew heavily to DTM/GTE/safety-car race variants.

## Alfa Romeo / Mini / Volvo / Lada / DeLorean / Jeep

| Model | Chassis | Licence | Author | Faces | Pick | Link |
| --- | --- | --- | --- | --- | --- | --- |
| 1965 Alfa Romeo Giulia Sprint | 105 | CC-BY | dagtholander | 110,220 | | https://sketchfab.com/3d-models/none-3b30a0277a7b45a58496c843e6588212 |
| 2017 Alfa Romeo Giulia Quadrifoglio | 952 | CC-BY | Galaxy Car Showroom | 66,157 | | https://sketchfab.com/3d-models/none-6ab89536590d478598d64396ad4ac4ca |
| Mini Cooper Mk1 | Mk1 | CC-BY | Ivan_WSK | 39,506 | | https://sketchfab.com/3d-models/none-0b032262d5a34360ae55390eb23b36f7 |
| LADA VAZ 2105 (Free) | 2105 | CC-BY | Ermakov | 103,034 | | https://sketchfab.com/3d-models/none-3bd3c4aeba2c4a65aa4e8a57c193d432 |
| DeLorean DMC-12 | DMC-12 | CC-BY | JandroS | 169,930 | | https://sketchfab.com/3d-models/none-7001f739fe594314b5a3081163577139 |
| 2007 Jeep Wrangler Rubicon | JK | CC-BY | Maroi Mister | 85,314 | | https://sketchfab.com/3d-models/none-e8ad5a9f0489416599c50781e08bf70c |

Honest gaps: Volvo 240 coverage is very thin — one 462k-face full car
(over the preferred range) and otherwise single parts; classic Mini full cars
in range are scarce; Lada is fine but mostly unlabelled trim levels.

## The ten implemented picks

All ten are CC-BY (attribution only, commercial use allowed) and span ten
marques: Toyota Supra A80, Nissan Skyline R34, Mazda RX-7 FD, Subaru Impreza
GC8, BMW M3 E30, Mercedes 190E W201, Porsche 911 964, VW Golf GTI Mk1,
Ford Mustang 1965, Lamborghini Countach 5000QV. See `src/data/more-cars.ts`.
