export const state = {
    allPokemon: [],
    filtered: [],
    currentPage: 1,

    types: [],
    generations: [],

    filters: {
        search: "",
        type: null,
        generation: null,
        hp: 0,
        attack: 0
    },

    sortMode: "id-asc"
};