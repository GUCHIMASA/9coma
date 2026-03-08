# 9coma Project Context

## Overview
9coma is a web application where users can create and share their top 9 comics (私を構成する9冊).
It utilizes Firebase for hosting and Next.js as the application framework.

## Recent Changes
- **[2026-03-08] Text & OGP Adjustment**: Modified all occurrences of "〜を構成する漫画9選" to "私を構成する9つのマンガ" across the project. Updated OGP text, layout, and share intent tweet hashtags (`#9coma #9koma #私を構成する9つのマンガ`).
- **[2026-03-08] OGP Image Layout Update**: Changed `src/app/list/[id]/opengraph-image.tsx` to generate a 1200x630 layout featuring a 2x5 grid of comics and dynamic text for the user's top 9 comics.

## Workflow & Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Deploy**: `npx firebase deploy` (or `firebase deploy`)
