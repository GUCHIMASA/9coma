# 9coma Project Context

## Overview
9coma is a web application where users can create and share their top 9 comics (私を構成する9冊).
It utilizes Firebase for hosting and Next.js as the application framework.

## Recent Changes
- **[2026-03-08] Text & OGP Adjustment**: Modified all occurrences of "〜を構成する漫画9選" to "私を構成する9つのマンガ" across the project. Updated OGP text, layout, and share intent tweet hashtags (`#9coma #9koma #私を構成する9つのマンガ`).
- **[2026-03-08] Text & OGP Adjustment**: Modified all occurrences of "〜を構成する漫画9選" to "私を構成する9つのマンガ" across the project. Updated OGP text, layout, and share intent tweet hashtags (`#9coma #9koma #私を構成する9つのマンガ`).
- **[2026-03-08] OGP Image Layout Update**: Changed `src/app/list/[id]/opengraph-image.tsx` to generate a 1200x630 layout featuring a 2x5 grid of comics and dynamic text for the user's top 9 comics.
- **[2026-03-08] OGP Image Redesign & Slot 5 Highlight**: Redesigned the OGP layout to match the new mockup (Slot 5 on the left with a badge, other 8 slots in a 2x4 grid on the right). Highlighted Slot 5 with a pink background `#FFA8B8` on the homepage and OGP image to signify its importance.
- **[2026-03-08] Top Page Static OGP**: Added a custom static OGP image specifically for the top page (`src/app/opengraph-image.png`) using the provided `9coma_ogp2.png` asset.

## Workflow & Commands
- **Dev**: `npm run dev`
- **Build**: `npm run build`
- **Deploy**: `npx firebase deploy` (or `firebase deploy`)
