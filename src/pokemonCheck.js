import fetch from "node-fetch";
import readline from "readline";

const POKEMON_API = "https://pokeapi.co/api/v2/pokemon/";
const PORT = 8000
async function getPokemonInfo(pokemonName) {
    try {
        // Get Pokémon's types
        const response = await fetch(`${POKEMON_API}${pokemonName}`);
        if (!response.ok) throw new Error(`Pokemon '${pokemonName}' not found`);
        const data = await response.json();

        const types = data.types.map(t => t.type.name);
        console.log(`\n🔹 Pokemon '${pokemonName}' has types: ${types.join(", ")}`);

        const matrixRes = await fetch(`http://localhost:${PORT}/matrix`);
        const matrixData = await matrixRes.json();
        const { types: allTypes, matrix } = matrixData;

        const finalMultipliers = {};
        for (let i = 0; i < allTypes.length; i++) {
            const attackType = allTypes[i];
            let multiplier = 1;
            for (const defType of types) {
                const defIndex = allTypes.indexOf(defType);
                multiplier *= matrix[defIndex][i];
            }
            finalMultipliers[attackType] = multiplier;
        }
        const weaknesses = [];
        const resistances = [];
        const immunities = [];

        // Categorize and sort
        for (const [type, value] of Object.entries(finalMultipliers)) {
            if (value === 0) immunities.push({ type, value });
            else if (value > 1) weaknesses.push({ type, value });
            else if (value < 1) resistances.push({ type, value });
        }
        
        weaknesses.sort((a, b) => b.value - a.value);
        resistances.sort((a, b) => a.value - b.value);
        immunities.sort((a, b) => a.type.localeCompare(b.type));
        
        console.log("\n🔥 Weaknesses:");
        weaknesses.forEach(w => console.log(`   ${w.type} → ×${w.value}`));
        console.log("\n🛡️ Resistances:");
        resistances.forEach(r => console.log(`   ${r.type} → ×${r.value}`));
        console.log("\n⛔ Immunities:");
        immunities.forEach(i => console.log(`   ${i.type} → ×${i.value}`));
    } catch (error) {
        console.error("Error:", error.message);
    }
}

// Interactive CLI
async function interactiveCLI() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askPokemon = () => {
        rl.question("\nEnter Pokémon name (or 'exit' to quit): ", async (name) => {
            if (name.toLowerCase() === "exit") {
                console.log("Goodbye! 👋");
                rl.close();
                return;
            }
            await getPokemonInfo(name.toLowerCase());
            askPokemon();
        });
    };
    askPokemon();
}
(async () => {
    interactiveCLI();
})();