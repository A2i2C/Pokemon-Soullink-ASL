// --- KONFIGURATION ---
const SUPABASE_URL = "https://sbteykcuvbjlcghbtcqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_pYVsZk-cxgbJJPVvmi7Szg_vgQfNNHj";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const mainScope = document.getElementById("main-scope"); // Für den Listener
const trackerList = document.getElementById("trackerList"); // Für loadRoutes
let showDead = false; // Steuert die Sichtbarkeit von "toten" Routen

// --- FUNKTIONEN ---

// Der Kanal abonniert alle Änderungen an der Tabelle 'Pokemon'
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
      console.log("Echtzeit-Update empfangen!", payload);
      loadRoutes(); // Ruft deine Funktion von oben auf, um die Liste neu zu zeichnen
    },
  )
  .subscribe();

async function loadRoutes() {
  trackerList.innerHTML = ""; // Leert die aktuelle Liste, bevor neue Daten geladen werden

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

    playerList.forEach((player) => {
      const playerTemplate = document.getElementById("playerTemplate");
      const playerTemplateClone = playerTemplate.content.cloneNode(true);

      const playersContainer = routeTemplateClone.querySelector(".players-container");

      playerTemplateClone.querySelector(".poke-name").textContent = row[player] || "---";

      const btnPokemonUpdate = playerTemplateClone.querySelector(".btn-update");
      btnPokemonUpdate.dataset.player = player;

      playersContainer.appendChild(playerTemplateClone);
    });

    const deathBtn = routeTemplateClone.querySelector(".btn-death");
    deathBtn.textContent = row.status === "alive" ? "MARK DEAD 💀" : "REVIVE 😇";
    
    if (showDead === false && row.status === "dead") return;
    trackerList.appendChild(routeTemplateClone);
  });
}

async function createRoute() {
  const name = document.getElementById("newRouteName").value;
  if (!name) return alert("Namen eingeben!");

  const { error } = await _supabase
    .from("Pokemon")
    .insert([
      { route: name, sven: "---", aziz: "---", luigi: "---", status: "alive" },
    ]);

  if (error) alert(error.message);
  else {
    document.getElementById("newRouteName").value = "";
  }
}

async function updatePoke(id, player) {
  const newPoke = prompt(`Welches Pokémon hat ${player} gefangen?`);
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

async function deleteRoute(id) {
  if (!confirm("Willst du diese Route wirklich löschen?")) return;

  await _supabase
    .from("Pokemon")
    .delete()
    .eq("id", id);
}

// --- EVENT LISTENER ---
mainScope.addEventListener("click", function (e) {
  const wrapper = e.target.closest(".route-wrapper");
  // Globale Funktionen

  if (e.target.id === "toggleDead") {
    showDead = e.target.checked;
    loadRoutes(); // Neu laden, da keine Echtzeit-Updates für das Filtern existieren
    return;
  }
  if (e.target.id === "addRouteBtn") {
    createRoute();
    return;
  }

  // Routen-Logik
  const routeId = wrapper.dataset.id;
console.log("Klick auf Route mit ID:", routeId);
    if (e.target.id === "deleteRouteBtn") {
      console.log("Lösche Route mit ID:", routeId);
    deleteRoute(routeId);
  }

  if (e.target.classList.contains("btn-update")) {
    const player = e.target.dataset.player;
    updatePoke(routeId, player);
  }

  if (e.target.classList.contains("btn-death")) {
    const currentStatus = e.target.textContent.includes("REVIVE")
      ? "dead"
      : "alive"; // Wenn der Button "revive" anzeigt, ist die Route aktuell "dead" deswegen setzen wir den Status auf "alive" und umgekehrt
    toggleStatus(routeId, currentStatus);
  }
});

// Start
loadRoutes();
