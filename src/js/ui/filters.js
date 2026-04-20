import { state } from "../state.js";

export function applyFilters() {

    const f = state.filters;

    const result = state.allPokemon.filter(p => {

        if (!p || !p.types || !p.stats) return false;

        const matchSearch =
            p.name.toLowerCase().includes(f.search);

        const matchType =
            !f.type ||
            p.types.some(t => t.type.name === f.type);

        const matchGen =
            !f.generation ||
            f.generation.pokemon.includes(p.name);

        const hp =
            p.stats.find(s => s.stat.name === "hp")?.base_stat || 0;

        const atk =
            p.stats.find(s => s.stat.name === "attack")?.base_stat || 0;

        return (
            matchSearch &&
            matchType &&
            matchGen &&
            hp >= f.hp &&
            atk >= f.attack
        );
    });

    state.filtered = sortList([...result]);

    return state.filtered.length;
}

// Ordenar por ...
function sortList(list) {

    const getStat = (p, stat) =>
        p.stats.find(s => s.stat.name === stat)?.base_stat || 0;

    const sorted = [...list];

    switch (state.sortMode) {

        case "id-asc":
            return sorted.sort((a, b) => a.id - b.id);

        case "id-desc":
            return sorted.sort((a, b) => b.id - a.id);

        case "hp-asc":
            return sorted.sort((a, b) =>
                getStat(a, "hp") - getStat(b, "hp")
            );

        case "hp-desc":
            return sorted.sort((a, b) =>
                getStat(b, "hp") - getStat(a, "hp")
            );

        case "attack-asc":
            return sorted.sort((a, b) =>
                getStat(a, "attack") - getStat(b, "attack")
            );

        case "attack-desc":
            return sorted.sort((a, b) =>
                getStat(b, "attack") - getStat(a, "attack")
            );

        default:
            return sorted;
    }
}