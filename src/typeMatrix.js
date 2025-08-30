import fs from 'fs';
import http from 'http';
import fetch from 'node-fetch';

const PORT = 8000;
const API_URL = 'https://pokeapi.co/api/v2/type/';
const OUTPUT_FILE = "type_matrix.json";

// Fetch all Pokémon types from the API
async function fetchAllTypes() {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch types');
    const data = await response.json();
    return data.results.map(type => type.name).filter(t => t !== 'unknown');
}

// Fetch type effectiveness data 
async function fetchTypeEffectiveness(type) {
    const response = await fetch(`${API_URL}${type}`);
    if (!response.ok) throw new Error(`Failed to fetch data for ${type}`);
    return await response.json();
}

// Build the type effectiveness matrix
async function buildTypeMatrix() {
    console.log("Fetching all Pokémon types...");
    const types = await fetchAllTypes();
    const typeIndex = {};
    types.forEach((type, i) => typeIndex[type] = i);

    const matrix = Array.from({ length: types.length }, () =>
        Array.from({ length: types.length }, () => 1)
    );

    for (const attackingType of types) {
        console.log(`Fetching damage relations for ${attackingType}...`);
        const typeData = await fetchTypeEffectiveness(attackingType);

        for (const t of typeData.damage_relations.double_damage_to) {
            if (typeIndex[t.name] !== undefined) {
                matrix[typeIndex[t.name]][typeIndex[attackingType]] = 2;
            }
        }
        for (const t of typeData.damage_relations.half_damage_to) {
            if (typeIndex[t.name] !== undefined) {
                matrix[typeIndex[t.name]][typeIndex[attackingType]] = 0.5;
            }
        }
        for (const t of typeData.damage_relations.no_damage_to) {
            if (typeIndex[t.name] !== undefined) {
                matrix[typeIndex[t.name]][typeIndex[attackingType]] = 0;
            }
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ types, matrix }, null, 4));
    console.log(`Matrix saved to '${OUTPUT_FILE}'`);
}

// Build the matrix and start the server
const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const { types, matrix } = JSON.parse(fs.readFileSync(OUTPUT_FILE));

    // Attack vs Defend query
    if (url.searchParams.has("attacker") && url.searchParams.has("defender")) {
        const attacker = url.searchParams.get("attacker").toLowerCase();
        const defender = url.searchParams.get("defender").toLowerCase();

        if (!types.includes(attacker) || !types.includes(defender)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Invalid type" }));
        }

        const multiplier = matrix[types.indexOf(defender)][types.indexOf(attacker)];
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ attacker, defender, multiplier }, null, 2));
    }

    // Attack query
    if (req.url.startsWith("/attack/")) {
        const type = req.url.split("/attack/")[1].toLowerCase();
        if (!types.includes(type)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Invalid type"   }));
        }

        const attackProfile = {};
        types.forEach(defender => {
            attackProfile[defender] = matrix[types.indexOf(defender)][types.indexOf(type)];
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ attacker: type, damage_to: attackProfile }, null, 2));
    }

    // Defend query
    if (req.url.startsWith("/defend/")) {
        const type = req.url.split("/defend/")[1].toLowerCase();
        if (!types.includes(type)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Invalid type" }));
        }

        const defendProfile = {};
        types.forEach(attacker => {
            defendProfile[attacker] = matrix[types.indexOf(type)][types.indexOf(attacker)];
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ defender: type, damage_from: defendProfile }, null, 2));
    }

    if (req.url === "/matrix") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ types, matrix }));
        return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid endpoint" }));
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
