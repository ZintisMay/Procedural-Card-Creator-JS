const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function cardId(faction, type, icons, text) {
  const content = JSON.stringify({ faction, type, icons: [...icons].sort(), text });
  return crypto.createHash('sha256').update(content).digest('hex');
}

const traitsDir = path.join(__dirname, 'traits');

const traitFiles = fs.readdirSync(traitsDir).filter(f => f.endsWith('.json'));

const traits = {};

for (const file of traitFiles) {
  const varName = path.basename(file, '.json');
  const raw = fs.readFileSync(path.join(traitsDir, file), 'utf8').trim();

  if (!raw) {
    console.warn(`Warning: ${file} is empty — skipping.`);
    continue;
  }

  try {
    traits[varName] = JSON.parse(raw);
  } catch (err) {
    console.error(`Error parsing ${file}: ${err.message}`);
  }
}

const { factions, icons, textEffects, types } = traits;

// Generate combinatorially complete card set (one of each trait per card)
const cards = [];
const nameCounters = {};

for (const faction of factions) {
  for (const type of types) {
    for (const icon of icons) {
      for (const text of textEffects) {
        const baseName = `${faction} ${type}`;
        nameCounters[baseName] = (nameCounters[baseName] || 0) + 1;

        cards.push({
          id: cardId(faction, type, [icon], text),
          name: `${baseName} #${nameCounters[baseName]}`,
          faction,
          type,
          icons: [icon],
          text,
        });
      }
    }
  }
}

const outputPath = path.join(__dirname, 'cards.json');
fs.writeFileSync(outputPath, JSON.stringify(cards, null, 2), 'utf8');
console.log(`Generated ${cards.length} cards → cards.json`);

function toCsv(rows) {
  const headers = ['id', 'name', 'faction', 'type', 'icons', 'text'];
  const escape = val => {
    const str = Array.isArray(val) ? val.join('|') : String(val);
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };
  const lines = [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))];
  return lines.join('\n');
}

const csvPath = path.join(__dirname, 'cards.csv');
fs.writeFileSync(csvPath, toCsv(cards), 'utf8');
console.log(`Generated ${cards.length} cards → cards.csv`);
