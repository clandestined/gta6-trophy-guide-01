# Leonida Legend — GTA VI Trophy Guide & Tracker

[![make.fun](https://img.shields.io/badge/make.fun-gta6--trophy--guide--01-ff5ea8)](https://make.fun/c/gta6-trophy-guide-01)
[![trophies](https://img.shields.io/badge/trophies-55-2fd4c4)](https://make.fun/c/gta6-trophy-guide-01)
[![offline](https://img.shields.io/badge/offline-yes-ffd166)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI: 1 platinum, 2 gold, 6 silver and 46 bronze.

## What it does

- **Checklist with the official list**: every trophy shown with its official name, description and grade exactly as PlayStation publishes them, plus a guide written in our own words and the sources behind it (PSNProfiles, Exophase, PowerPyx, GamesRadar+, GTABase, Insider Gaming).
- **Tracker**: tick trophies off and progress saves in the browser (localStorage), with a progress bar and per-grade counts. Export progress to a file and import it back.
- **Filters**: by kind (story, missable, collectibles, activities, completion, online), by grade, by search text, and hide-earned.
- **Spoiler setting**: hides the names and descriptions of hidden story trophies until they are earned.
- **Roadmap to the platinum**: 8 stages in order, from the story through the one missable trophy, contacts, activities, collectibles, crime and 100% completion. PowerPyx rates the platinum 4/10 and about 200 hours in a single playthrough.
- **Missables**: only one trophy is flagged possibly missable (Positive Mental Attitude — meditate at all 18 spots; one spot can become unavailable later, per PowerPyx and GTABase), and the guide says so plainly.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Static files under `app/` only; it works with the network off and loads nothing from outside `app/`. No Rockstar logo, artwork or game screenshots are used; the look is original.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
