import fs from "fs";
import fetch from "node-fetch";

const POKEMON_FILE = "../data/pokemon.txt";
const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

async function getPokemonData(pokemonidentifier) {
  try {
    // Fetch basic Pokémon data
    const response = await fetch(
      `${API_URL}${pokemonidentifier.toLowerCase()}`
    );
    if (!response.ok)
      throw new Error(`Failed to fetch data for ${pokemonidentifier}`);
    const data = await response.json();

    const pokemonName = data.name;
    const pokemonId = data.id;

    const abilities = data.abilities.map(
      (abilityInfo) => abilityInfo.ability.name
    );
    const types = data.types.map((typeInfo) => typeInfo.type.name);

    const speciesRes = await fetch(
      `${SPECIES_URL}${pokemonidentifier.toLowerCase()}`
    );
    if (!speciesRes.ok)
      throw new Error(`Failed to fetch species data for ${pokemonidentifier}`);
    const speciesData = await speciesRes.json();

    return {
      pokemonName,
      pokemonId,
      abilities,
      types,
      is_legendary: speciesData.is_legendary || false,
      is_mythical: speciesData.is_mythical || false,
    };
  } catch (error) {
    console.error(`Error fetching data for ${pokemonidentifier}:`, error);
    return null;
  }
}

async function main() {
  // Allow output file via command line argument
  const OUTPUT_FILE = process.argv[2] || "pokemon_data.json";
  try {
    const fileData = fs.readFileSync(POKEMON_FILE, "utf-8");
    const pokemons = fileData
      .split("\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const results = {};
    for (const pokemon of pokemons) {
      console.log(`Fetching data for ${pokemon}...`);
      const data = await getPokemonData(pokemon);
      if (data) {
        results[data.pokemonName] = {
          abilities: data.abilities,
          types: data.types,
          is_legendary: data.is_legendary,
          is_mythical: data.is_mythical,
        };
      }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 4));
    console.log(`Data saved to '${OUTPUT_FILE}'`);
  } catch (error) {
    console.error("Error: ", error);
    return;
  }
}

main();
