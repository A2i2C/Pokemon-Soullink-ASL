// --- KONFIGURATION ---
const SUPABASE_URL = "https://sbteykcuvbjlcghbtcqt.supabase.co";
const SUPABASE_KEY = "sb_publishable_pYVsZk-cxgbJJPVvmi7Szg_vgQfNNHj";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
let showDead = false; // Steuert die Sichtbarkeit von "toten" Routen

// --- FUNKTIONEN ---

// Der Kanal abonniert alle Änderungen an der Tabelle 'Pokemon'
const channel = _supabase
  .channel("public:Pokemon") // Name des Kanals
  .on(
    "postgres_changes",
    {
      event: "*", // Höre auf Alles: Neue Zeilen, Updates, Löschen
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
  const { data, error } = await _supabase
    .from("Pokemon")
    .select("*")
    .order("id", { ascending: true }); // Sortiert nach der ID (1, 2, 3...)

  if (error) {
    console.error(error);
    return;
  }

  const list = document.getElementById("trackerList");
  list.innerHTML = "";

  data.forEach((row) => {
    const div = document.createElement("div");
    div.className = `route-grid ${row.status === "dead" ? "dead" : ""}`;

    div.innerHTML = `
                    <div style="font-weight:bold">${row.route}</div>
                    <div>${row.sven || "---"} <br> <button class="btn-update" onclick="updatePoke('${row.id}', 'sven')">✍️</button></div>
                    <div>${row.aziz || "---"} <br> <button class="btn-update" onclick="updatePoke('${row.id}', 'aziz')">✍️</button></div>
                    <div>${row.luigi || "---"} <br> <button class="btn-update" onclick="updatePoke('${row.id}', 'luigi')">✍️</button></div>
                    <div>
                        <button class="btn-death" onclick="toggleStatus('${row.id}', '${row.status}')">
                            ${row.status === "alive" ? "MARK DEAD 💀" : "REVIVE 😇"}
                        </button>
                    </div>
                `;
    if (row.status === "dead" && !showDead) return;
    list.appendChild(div);
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

  

// --- EVENT LISTENER ---
document.getElementById("addRouteBtn").addEventListener("click", createRoute);
document.getElementById("toggleDead").addEventListener("change", function() {
  showDead = this.checked;
  loadRoutes();
});

// Start
loadRoutes();
