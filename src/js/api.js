export async function getAllPokemon() {

    try {

        const res = await fetch(
            "https://pokeapi.co/api/v2/pokemon?limit=1302"
        );

        if (!res.ok) {
            throw new Error("Error HTTP en Pokémon");
        }

        const data = await res.json();

        const details = await Promise.all(
            data.results.map(async (p) => {

                const r = await fetch(p.url);

                if (!r.ok) {
                    throw new Error(`Error cargando ${p.name}`);
                }

                return await r.json();
            })
        );

        return {
            count: data.count,
            results: details
        };

    } catch (err) {
        console.error("getAllPokemon error:", err);
        throw err;
    }
}

export async function getTypes() {

    try {

        const res = await fetch("https://pokeapi.co/api/v2/type");

        if (!res.ok) {
            throw new Error("Error cargando types");
        }

        const data = await res.json();

        return data.results
            .map(t => t.name)
            .filter(t => t !== "unknown" && t !== "shadow");

    } catch (err) {
        console.error(err);
        throw err;
    }
}

export async function getGenerations() {

    try {

        const res = await fetch("https://pokeapi.co/api/v2/generation");

        if (!res.ok) {
            throw new Error("Error cargando generaciones");
        }

        const data = await res.json();

        return await Promise.all(
            data.results.map(async gen => {

                const r = await fetch(gen.url);

                if (!r.ok) {
                    throw new Error(`Error gen ${gen.name}`);
                }

                const detail = await r.json();

                return {
                    name: gen.name,
                    pokemon: detail.pokemon_species.map(p => p.name)
                };
            })
        );

    } catch (err) {
        console.error(err);
        throw err;
    }
}