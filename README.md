# Pixel Survivors

A browser-based survival game inspired by Vampire Survivors. Fight off endless waves of enemies, collect XP and gold, and see how long you can last.

**Play it:** https://d30g031btwgh5p.cloudfront.net

## Gameplay

- Move with WASD or Arrow Keys
- Attacks are automatic
- Kill enemies to collect XP (level up) and Gold (shop upgrades)
- Every 30 seconds a strong wave spawns — difficulty increases over time

## Characters

- **Gunner** — ranged auto-fire, fast, 80 HP
- **Warrior** — melee sweep attack, tanky, 120 HP

## Tech Stack

Pure HTML5 Canvas + Vanilla JS — no frameworks, no build step. Just open `index.html`.

## Deployment

Hosted on AWS S3 + CloudFront. CI/CD via GitHub Actions on push to `main`.

## License

MIT
