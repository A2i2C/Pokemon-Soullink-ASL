// --- KONFIGURATION ---
const SUPABASE_URL = "https://sbteykcuvbjlcghbtcqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_pYVsZk-cxgbJJPVvmi7Szg_vgQfNNHj";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const mainScope = document.getElementById("main-scope"); // Für den Listener
const trackerList = document.getElementById("trackerList"); // Für loadRoutes
let showDead = false; // Steuert die Sichtbarkeit von "toten" Routen
let routeFavorites = {}; // Favoriten-Cache pro Route-ID
let pokeRoutesPerPlayer = {}; // Alle Pokemon der Routen in einem Json-Objekt vom Typ { player: [pokemon] }

// --- FUNKTIONEN ---

async function loadRoutes() {
  trackerList.innerHTML = ""; // Leert die aktuelle Liste, bevor neue Daten geladen werden, sonst würden sich die Einträge untereinander hinzufügen


  const { data, error } = await _supabase
    .from("Pokemon")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const playerList = ["sven", "aziz", "luigi"];

  data.forEach((row) => {
    const routeTemplate = document.getElementById("routeTemplate");
    const routeTemplateClone = routeTemplate.content.cloneNode(true);

    const route = routeTemplateClone.querySelector(".route-wrapper");
    route.dataset.id = row.id;
    routeTemplateClone.querySelector(".route-name").textContent = row.route;
    if (row.status === "dead") route.classList.add("dead");
    routeFavorites[row.id] = Array.isArray(row.favorite) ? row.favorite : [];
    pokeRoutesPerPlayer[row.id] = { aziz: row.aziz, sven: row.sven, luigi: row.luigi };

    playerList.forEach((player) => {
      const playerTemplate = document.getElementById("playerTemplate");
      const playerTemplateClone = playerTemplate.content.cloneNode(true);
      const starBtn = playerTemplateClone.querySelector(".star-btn");

      const playersContainer = routeTemplateClone.querySelector(".players-container");
      const gespeicherteDaten = localStorage.getItem("json");
      const pokedex = JSON.parse(gespeicherteDaten);
      console.log(pokedex)
      const treffer = pokedex.find(p => p.name === "ivysaur");
      console.log(treffer)
      playerTemplateClone.querySelector(".poke-image").src = treffer.sprites;

      playerTemplateClone.querySelector(".poke-name").textContent = row[player] || "---";
      const btnPokemonUpdate = playerTemplateClone.querySelector(".btn-update");
      btnPokemonUpdate.dataset.player = player;

      starBtn.textContent = "☆";
      starBtn.dataset.player = player;

      if (routeFavorites[row.id].includes(player)) {
        starBtn.classList.add("favorited");
        starBtn.textContent = "⭐";
      }

      playersContainer.appendChild(playerTemplateClone);
    });

    const deathBtn = routeTemplateClone.querySelector(".btn-death");
    deathBtn.textContent = row.status === "alive" ? "MARK DEAD 💀" : "REVIVE 😇";
    
    if (showDead === false && row.status === "dead") return;
    trackerList.appendChild(routeTemplateClone);
  });
}

async function createRoute() {
  const name = document.getElementById("routeName").value;
  if (!name) return alert("Namen eingeben!");

  const { error } = await _supabase
    .from("Pokemon")
    .insert([
      { route: name, sven: "---", aziz: "---", luigi: "---", status: "alive", favorite: [] },
    ]);

  if (error) alert(error.message);
  else {
    document.getElementById("routeName").value = "";
  }
}

async function updatePoke(id, player) {
  let newPoke = "";

if(pokeRoutesPerPlayer[id]) {
  newPoke = prompt(`Neuer Pokémon-Name für ${player} :`, pokeRoutesPerPlayer[id][player]);
}
else {
  newPoke = prompt(`Neuer Pokémon-Name für ${player}:`);
}

  if (newPoke === null) return;



  const updateData = {};
  updateData[player] = newPoke;

  const { error } = await _supabase
    .from("Pokemon")
    .update(updateData)
    .eq("id", id);

  if (error) alert(error.message);
}

async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === "alive" ? "dead" : "alive";
  const { error } = await _supabase
    .from("Pokemon")
    .update({ status: newStatus })
    .eq("id", id);

  if (error) alert(error.message);
}

async function toggleFavorite(id, player) {
  let favorites = [...(routeFavorites[id] || [])];

  if (favorites.includes(player)) {
    favorites = favorites.filter((p) => p !== player); 
  } else {
    favorites.push(player); 
  }

  const { error } = await _supabase
    .from("Pokemon")
    .update({ favorite: favorites })
    .eq("id", id);

  if (error) alert(error.message);
  else routeFavorites[id] = favorites;
}

async function deleteRoute(id) {
  if (!confirm("Willst du diese Route wirklich löschen?")) return;

  await _supabase
    .from("Pokemon")
    .delete()
    .eq("id", id);
}


// --- EVENT LISTENER ---

document.getElementById("newRouteName").addEventListener("submit", function(e) {
    createRoute();
    e.preventDefault(); // WICHTIG: Verhindert das Neuladen der Seite
});
  const modal = document.getElementById("gymLevelModal");

mainScope.addEventListener("click", function (e) {
  //Open Modal side close Modal
  if (e.target === modal) {
    modal.classList.remove("show");
  }

  // Globale Funktionen
  if (e.target.id === "toggleDead") {
    showDead = e.target.checked;
    loadRoutes(); // Neu laden, da keine Echtzeit-Updates für das Filtern existieren
  }

  if (e.target.id === "openModalBtn") {
    modal.classList.add("show");
  }

  if (e.target.id === "closeModalBtn") {
    modal.classList.remove("show");
  }

  // Routen-Logik
  const wrapper = e.target.closest(".route-wrapper");
  const routeId = wrapper?.dataset?.id;
  const player = e.target?.dataset?.player;

  if (e.target.id === "deleteRouteBtn") {
    deleteRoute(routeId);
  }
  if (e.target.classList.contains("btn-update")) {
    updatePoke(routeId, player);
  }
  if (e.target.classList.contains("star-btn")) {
    toggleFavorite(routeId, player);
  }

  if (e.target.classList.contains("btn-death")) {
    const currentStatus = e.target.textContent.includes("REVIVE")
      ? "dead"
      : "alive"; // Wenn der Button "revive" anzeigt, ist die Route aktuell "dead" deswegen setzen wir den Status auf "alive" und umgekehrt
    toggleStatus(routeId, currentStatus);
  }


});

// --- ECHTZEIT-UPDATE ---
const channel = _supabase
  .channel("public:Pokemon") // Name des Kanals
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "Pokemon",
    },
    (payload) => {
      routeFavorites[payload.new.id] = payload.new.favorite || [];
      pokeRoutesPerPlayer[payload.new.id] = { aziz: payload.new.aziz, sven: payload.new.sven, luigi: payload.new.luigi };
      loadRoutes();
    },
  )
  .subscribe();

// Start
loadRoutes();
