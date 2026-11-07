# kevin killer

a little pile of games where kevin has a bad day.

## pages

| file | what it is |
| --- | --- |
| `index.html` (+ `home.css`, `home.js`) | home page, pick a game |
| `killer.html` (+ `killer.js`) | guess who's the REAL kevin killer: hoist him up a rope |
| `tomato.html` (+ `tomato.js`, `tomato.css`) | throw tomatoes / pies / bricks / knives at kevin, he dodges at random |
| `style.css` | shared look (colours, buttons, hud, dark mode) |
| `assets/` | sprites for the rope game |
| `assets_2/` | new kevin sprites, tomato, splash sound |

open `index.html` to start. everything works by double clicking it. on a local server (`python3 -m http.server`) the tomato hit zones follow kevin's exact outline; opened straight from a folder the browser blocks pixel reading so it uses a rough head + body shape instead.

## keys

| key | action |
| --- | --- |
| R | reset (both games) |
| D | dark mode |
| M | rope game: mode, tomato game: sound on/off |
| 1-5 | tomato game: pick tomato / pie / brick / knife / random |
| Esc / Q | back to the home page |

the rope game's controls (hold mouse / space / down to pull, drag the boy) are unchanged.
