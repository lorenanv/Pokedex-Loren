import { getTypeColor, getTypeSpanish } from "../ui/typeColors.js";

export function showLoading() {

    const ui = document.getElementById("ui-state");
    const grid = document.getElementById("container-pokemon");

    ui.classList.add("active");
    grid.style.display = "none";

    ui.innerHTML = `
        <div class="loading-wrapper">
            <h2 class="loading-title">CARGANDO</h2>
            <div class="spinner"></div>
            <p class="loading-text">Cargando Pokédex...</p>
        </div>
    `;
}

export function showError(message) {

    const ui = document.getElementById("ui-state");
    const grid = document.getElementById("container-pokemon");

    ui.classList.add("active");
    grid.style.display = "none";

    ui.innerHTML = `
        <div class="error-wrapper">
            <h2 class="error-title">⚡ Error</h2>
            <p class="error-text">${message}</p>
        </div>
    `;
}

export function showEmpty() {

    const ui = document.getElementById("ui-state");
    const grid = document.getElementById("container-pokemon");

    ui.classList.add("active");
    grid.style.display = "none";

    ui.innerHTML = `
        <div class="loading-wrapper">
            <h2 class="loading-title">🔍 Sin resultados</h2>
            <p class="loading-text">
                No hay Pokémon que coincidan con la búsqueda
            </p>
        </div>
    `;
}

export function showGrid() {

    const ui = document.getElementById("ui-state");
    const grid = document.getElementById("container-pokemon");

    ui.classList.remove("active");
    grid.style.display = "grid";
}

export function renderCards(pokemons, getPokemonTypes, getTypeColor) {

    const container = document.getElementById("container-pokemon");

    container.innerHTML = "";

    pokemons
        .filter(Boolean)
        .forEach(p => {

            const card =
                document.createElement("div");

            card.classList.add("card");

            const typesColor =
                p.types.map(t => {

                    const typeName =
                        t.type.name;

                    const color =
                        getTypeColor(typeName);

                    return `
                        <span
                            class="type"
                            style="background:${color}"
                        >
                            ${getTypeSpanish(typeName)}
                        </span>
                    `;

                }).join("");

            const capitalize =
                s =>
                    s.charAt(0).toUpperCase()
                    + s.slice(1);

            const image =
                p?.sprites?.other?.["official-artwork"]?.front_default ||
                p?.sprites?.other?.dream_world?.front_default ||
                p?.sprites?.front_default ||
                "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";

            card.innerHTML = `
                <p>#${p.id}</p>

                <h3>
                    ${capitalize(p.name)}
                </h3>

                <img
                    src="${image}"
                    alt="${p.name}"
                >

                <div class="types">
                    ${typesColor}
                </div>
            `;

            card.addEventListener("click", () => {
                showPokemonDetail(p);
            });

            container.appendChild(card);

        });

    showGrid();
}

// MODALS
// Ampliar carta Pokemon
export function showPokemonDetail(pokemon) {

    const ui = document.getElementById("pokemon-detail");

    ui.innerHTML = `
        <div class="detail-card">

                <button id="close-detail">✖</button>
                <div class="detail-header">
                    <img src="${pokemon.sprites.other['official-artwork'].front_default}" />
                    <div class = "card-align">
                        <p>#${pokemon.id}</p>
                        <h2>${pokemon.name.toUpperCase()}</h2>
                        <div class="detail-types">
                            ${pokemon.types.map(t => `
                                <span 
                                    class="type-badge"
                                    style="background:${getTypeColor(t.type.name)}"
                                >
                                    ${getTypeSpanish(t.type.name)}
                                </span>
                            `).join(" ")}
                        </div>
                    </div>
                </div>

            <div class="detail-tabs">
                <button class="tab active" data-tab="stats">Stats</button>
                <button class="tab" data-tab="info">Info</button>
                <button class="tab" data-tab="moves">Movimientos</button>
            </div>

            <div class="detail-content" id="tab-content">

                ${renderStats(pokemon)}

            </div>

        </div>
    `;

    ui.classList.add("active");

    // CLOSE
    document.getElementById("close-detail")
        .addEventListener("click", () => {
            ui.classList.remove("active");
        });

    // TABS
    const tabs = ui.querySelectorAll(".tab");
    const content = ui.querySelector("#tab-content");

    tabs.forEach(tab => {

        tab.addEventListener("click", () => {

            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const type = tab.dataset.tab;

            if (type === "stats") {
                content.innerHTML = renderStats(pokemon);
            }

            if (type === "info") {
                content.innerHTML = renderInfo(pokemon);
            }

            if (type === "moves") {
                content.innerHTML = renderMoves(pokemon);
            }
        });
    });
}

// Stats Pokemon
function renderStats(pokemon) {

    const statColors = {
        hp: "#44c464",
        attack: "#f4368f",
        defense: "#2196F3",
        "special-attack": "#9C27B0",
        "special-defense": "#58d8e9",
        speed: "#FFC107"
    };

    return `
        <h3>ESTADISTICAS BASE</h3>

        <div class = "stats-container">
        ${pokemon.stats.map(stat => {

                const name = stat.stat.name;
                const value = stat.base_stat;
                const color = statColors[name] || "#777";

                return `
                    <div class="stat-row">

                        <span class="stat-name">
                            ${formatStatName(name)}
                        </span>

                        <span class="stat-value">
                            ${value}
                        </span>

                        <div class="stat-bar">

                            <div 
                                class="stat-fill"
                                style="
                                    width:${Math.min(value, 150) / 1.5}%;
                                    background:${color};
                                "
                            ></div>

                        </div>

                    </div>
                `;
            }).join("")}
        </div>
    `;
}

function formatStatName(name) {

    const map = {
        hp: "HP",
        attack: "Ataque",
        defense: "Defensa",
        "special-attack": "At. Esp.",
        "special-defense": "Def. Esp.",
        speed: "Velocidad"
    };

    return map[name];
}

// Información Pokemon
function renderInfo(pokemon) {

    return `
        <h3>INFORMACION</h3>

        <p>Altura: <span class = "s-info">${pokemon.height}</span></p>
        <p>Peso: <span class = "s-info">${pokemon.weight}</span></p>

        <p>Tipos:
            <span class = "s-info">
                ${pokemon.types.map(t => getTypeSpanish(t.type.name)).join(", ")}
            </span>
        </p>

        <p>Habilidades:
            <span class = "s-info">
                ${pokemon.abilities.map(a => a.ability.name).join(", ")}
            </span>
        </p>
    `;
}

// Movimientos
function renderMoves(pokemon) {

    const moves = pokemon.moves
        .slice(0, 5)

    return `
        <h3>Movimientos (Top 5)</h3>
        <ul class="moves-grid">
            ${moves.map(m => `
                <li class="move-item">
                    ${m.move.name}
                </li>
            `).join("")}
        </ul>
    `;
}