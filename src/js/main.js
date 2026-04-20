import { state } from "./state.js";
import { renderCards, showError, showLoading, showGrid, showEmpty } from "./ui/renders.js";
import { applyFilters } from "./ui/filters.js";
import { getTypeColor, getTypeSpanish } from "./ui/typeColors.js";
import { renderPagination } from "./ui/pagination.js";

// Recargar página desde logo del header
document.getElementById("header-left")
.addEventListener("click", () => {
    location.reload();
});

// Listar 20 elementos
const ITEMS_PER_PAGE = 20;

let allTypes = [];
let generations = [];

// Cargar funciones al abrir la página
window.onload = async () => {

    try {

        showLoading();

        await loadAllPokemon();
        await loadTypes();
        await loadGenerations();

        setupStatRanges();
        updateUI();

        const total = applyFilters();

        if (total === 0) {

            showEmpty();
            return;
        }

        showGrid();
        loadPage(1);

    } catch (err) {

        console.error(err);
        showError("Ha ocurrido un error. Inténtelo más tarde.");
    }
};

// Obtener todos los Pokemon
async function loadAllPokemon() {

    const res = await fetch(
        "https://pokeapi.co/api/v2/pokemon?limit=1302"
    );

    // error HTTP (servidor responde mal)
    if (!res.ok) {
        throw new Error("Error HTTP en la API");
    }

    const data = await res.json();

    const results = await Promise.all(
        data.results.map(async (p) => {

            const r = await fetch(p.url);

            if (!r.ok) {
                throw new Error(`Error cargando ${p.name}`);
            }

            return await r.json();
        })
    );

    state.allPokemon = results.filter(p => p !== null);
    state.filtered = [...state.allPokemon];

    updateTotalPokemon(data.count);
}

// Total Pokemon en Pokedex
function updateTotalPokemon(total) {
    const el = document.getElementById("pokemonTotalNumber");
    if (!el) return;
    el.textContent = `${total} Pokémon`;
}

// Cargar tipos de los Pokemon - PokeAPI
async function loadTypes() {

    const res = await fetch("https://pokeapi.co/api/v2/type");
    const data = await res.json();

    allTypes = data.results
        .map(t => t.name)
        .filter(t => t !== "unknown" && t !== "shadow");

    renderTypeButtons();
}

// Obtener TIPOS
function getPokemonTypes(pokemon) {

    if (!pokemon || !pokemon.types) {
        return [];
    }

    return pokemon.types.map(
        t => t.type.name
    );
}

// Cargar generaciones - axios
async function loadGenerations() {

    try {
        const { data } = await axios.get("https://pokeapi.co/api/v2/generation");

        generations = await Promise.all(
            data.results.map(async gen => {

                const {data: detail } = await axios.get(gen.url);
                
                return {
                    name: gen.name,
                    pokemon: detail.pokemon_species.map(p => p.name)
                };
            })
        );

        renderGenerationButtons();
        
    } catch (error) {
        console.error("Error al cargar generaciones: ", error);
    }
    
}

// Renderizar los tipos en botones
function renderTypeButtons() {

    const container = document.getElementById("type-filters");
    container.innerHTML = "";

    allTypes.forEach(type => {

        const btn = document.createElement("button");
        btn.textContent = getTypeSpanish(type);
        btn.classList.add("type-btn");

        btn.style.background = getTypeColor(type);

        btn.addEventListener("click", () => {

            document.querySelectorAll(".type-btn")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            state.filters.type = type;
            applyFilters();
            loadPage(1);
            updateUI();
        });

        container.appendChild(btn);
    });
}

// Renderizar las generaciones en botones
function renderGenerationButtons() {

    const container = document.getElementById("generation-filters");
    container.innerHTML = "";

    generations.forEach(gen => {

        const btn = document.createElement("button");
        btn.textContent = formatGenerationName(gen.name);
        btn.classList.add("gen-btn");

        btn.addEventListener("click", () => {

            document.querySelectorAll(".gen-btn")
                .forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            state.filters.generation = gen;
            applyFilters();
            loadPage(1);
            updateUI();
        });

        container.appendChild(btn);
    });
}

// Cambiar cómo se muestra el nombre de las generaciones a formato: Gen 'X'
function formatGenerationName(name) {
    const roman = name.split("-")[1];
    return `Gen ${roman.toUpperCase()}`;
}

// Configurar stats (HP y Ataque)
function setupStatRanges() {

    const hpRange = document.getElementById("hp-range");
    const atkRange = document.getElementById("atk-range");

    const hpValues = state.allPokemon.map(p =>
        p.stats.find(s => s.stat.name === "hp").base_stat
    );

    const atkValues = state.allPokemon.map(p =>
        p.stats.find(s => s.stat.name === "attack").base_stat
    );

    hpRange.min = Math.min(...hpValues);
    hpRange.max = Math.max(...hpValues);
    hpRange.value = hpRange.min;

    atkRange.min = Math.min(...atkValues);
    atkRange.max = Math.max(...atkValues);
    atkRange.value = atkRange.min;

    state.filters.hp = Number(hpRange.min);
    state.filters.attack = Number(atkRange.min);
    updateUI();

    updateRangeLabels();
}

document.getElementById("hp-range").addEventListener("input", e => {
    state.filters.hp = Number(e.target.value);
    updateRangeLabels();
    applyFilters();
    loadPage(1);
});

document.getElementById("atk-range").addEventListener("input", e => {
    state.filters.attack = Number(e.target.value);
    updateRangeLabels();
    applyFilters();
    loadPage(1);
});

function updateRangeLabels() {
    document.getElementById("hp-value").textContent = state.filters.hp;
    document.getElementById("atk-value").textContent = state.filters.attack;
}

// Búsqueda - search input
document.getElementById("search-input")
.addEventListener("input", e => {

    state.filters.search =
        e.target.value.toLowerCase().trim();

    updateUI();
});

// Limpiar filtros - botón
document.getElementById("clear-filters")
.addEventListener("click", () => {

    state.filters = {
        search: "",
        type: null,
        generation: null,
        hp: 0,
        attack: 0
    };

    document.getElementById("search-input").value = "";

    document.querySelectorAll(".type-btn")
        .forEach(b => b.classList.remove("active"));

    document.querySelectorAll(".gen-btn")
        .forEach(b => b.classList.remove("active"));

    setupStatRanges();
    applyFilters();
    loadPage(1);
});

// Actualizar resultados búsqueda
export function updateResultsInfo(visible, total) {

    const el = document.getElementById("results-info");
    if (!el) return;
    
    const f = state.filters;

    const parts = [];

    if (f.search) parts.push(`para "${f.search}"`);
    if (f.type) parts.push(`tipo: ${getTypeSpanish(f.type)}`);
    if (f.generation) parts.push(`gen: ${f.generation.name}`);

    const filtersText =
        parts.length ? ` ${parts.join(" ")}` : "";

    el.textContent =
        `Mostrando ${visible} de ${total} resultados${filtersText}`;
}

// Ordenar por lista de opciones (id, ataque, HP)
document
    .getElementById("sort-select")
    .addEventListener("change", (e) => {

        state.sortMode = e.target.value;

        applyFilters();
        loadPage(1);
});

// Ordenar por id || hp || ataque asc/desc
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

// Actualizar cambios de la búsqueda a tiempo real
function updateUI() {

    applyFilters();

    const total = state.filtered.length;

    if (total === 0) {
        showEmpty();
        updateResultsInfo(0, 0);

        return;
    }

    showGrid();
    loadPage(1);
}

// Paginación
function loadPage(page) {

    state.currentPage = page;

    const offset = (page - 1) * ITEMS_PER_PAGE;

    const pageData = state.filtered.slice(
        offset,
        offset + ITEMS_PER_PAGE
    );

    renderCards(pageData, getPokemonTypes, getTypeColor);

    renderPagination(
        state.filtered.length,
        state.currentPage,
        ITEMS_PER_PAGE,
        loadPage
    );

    updateResultsInfo(
        pageData.length,
        state.filtered.length
    );
}