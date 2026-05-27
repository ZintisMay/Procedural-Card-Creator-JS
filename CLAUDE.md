# Procedural Card Creator

A Node.js tool that procedurally generates a combinatorially complete set of TCG cards from trait definition files, inspired by the generation system used by the Altered TCG.

## Running the project

```bash
node cardCreator.js       # generate cards.json and cards.csv once
npm run watch             # watch traits/ for changes and regenerate automatically
```

To view cards in the browser, open `cardViewer.html` via a local server:
- VS Code: Live Server extension → right-click `cardViewer.html` → Open with Live Server
- Terminal: `npx serve .` then visit the URL shown

## Key files

| File | Purpose |
|------|---------|
| `cardCreator.js` | Reads all trait files, generates the full Cartesian product, writes `cards.json` and `cards.csv` |
| `cardViewer.html` | Single-page browser UI — fetches `cards.json` and displays a searchable card gallery |
| `cards.json` | Generated card set (do not edit manually) |
| `cards.csv` | Same card set in CSV format (do not edit manually) |
| `sampleCards.json` | Reference example of the card data structure |
| `traits/` | Folder containing one JSON file per trait dimension |

## Trait files

Each file in `traits/` is a JSON array. Adding a new file is automatic — `cardCreator.js` picks it up without any code changes.

| File | Contents |
|------|---------|
| `factions.json` | Factions a card can belong to |
| `types.json` | Card types (e.g. Jedi, Sith) |
| `icons.json` | Icon keywords (e.g. Light, Dark) |
| `textEffects.json` | Mechanical effect strings |

## Card structure

```json
{
  "id": "30508180466d",
  "name": "Empire Jedi #1",
  "faction": "Empire",
  "type": "Jedi",
  "icons": ["Light"],
  "text": "When this enters, draw a card."
}
```

## Card ID

Each card gets a full 64-character SHA-256 hex ID derived from its trait values (`faction`, `type`, `icons`, `text`). The name is excluded from the hash so renaming doesn't change identity. If the same trait combination appears twice, the IDs will match — that's the duplicate detection mechanism.

Icons are sorted before hashing so order doesn't affect the ID. The full 64-character hash is used to avoid birthday-problem collisions at large design spaces (millions of cards).

## Architecture notes

- The card set is the full Cartesian product of all trait dimensions — one of each trait per card.
- `icons` is stored as an array to support multiple icons per card in the future.
- A display layer is planned to handle card text presentation separately from the mechanical effect stored in the data — rewording for display won't affect card identity.
- `cardViewer.html` searches across all fields including `faction` and supports partial matches.
