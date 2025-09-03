# Pokemon Data Tool

A backend project that fetches Pokémon details, analyzes their stats, and checks type effectiveness using a predefined type matrix.

## Features
- Fetch Pokemon data from the [PokeAPI](https://pokeapi.co/)
- Store Pokemon data locally in `pokemon_data.json` where the input pokemon list is in data/
- Check Pokemon stats and weaknesses
- Type effectiveness matrix for the pokemons
- 
## Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd src

# Install dependencies (if any)
npm install
```

## Detailed Features

### **1. Fetch Pokemon Data (TASK A)**
This script fetches Pokemon details from the PokeAPI and stores them locally.
```bash
node src/fetchPokemons.js
```
Input file will be present in data folder.
Output will be saved in `pokemon_data.json`.

### **2. Type Effectiveness (TASK B)**
The `pokemonCheck.js` script uses `type_matrix.json` created by `typeMatrix.js` and which is hosted on http server (`http://localhost:8000`) to calculate type effectiveness.
```bash
node src/typeMatrix.js
```

### **3. Check Pokemon Stats and Weaknesses (EXTRA)**
Use `pokemonCheck.js` to analyze Pokemon stats and find weaknesses by using the Type Matrix hosted by `typeMatrix.js`.
```bash
node src/pokemonCheck.js
```

## 📌 Example
```bash
$ node src/pokemonCheck.js
> Enter Pokémon name (or 'exit' to quit): pikachu
- Pokemon 'pikachu' has types: electric
🔥 Weaknesses:
   ground → ×2

🛡️ Resistances:
   flying → ×0.5
   steel → ×0.5
   electric → ×0.5

⛔ Immunities:
```
