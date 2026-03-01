#  Pokémon SoulLink Tracker
---

##  Setup & Downloads

* **Emulator:** [Emulator - Azahar](https://azahar-emu.org/) 
* **ROM:** [Pokemon - ROMS](https://r-roms.github.io/Populars/pokemon)
* **Randomizer:** [Randomizer](https://github.com/Ajarmar/universal-pokemon-randomizer-zx/releases)

---
## Die Live-Seite

 **[https://a2i2c.github.io/Pokemon-Soullink-ASL/]**

---

## Anleitung: aktualisieren des Trackers

Da wir die Seite statisch über GitHub hosten, müssen wir Änderungen direkt in der `data.json` Datei vornehmen.

### 1. Ein neues Pokémon-Paar hinzufügen
1. Öffne die Datei `data.json` hier im Repository.
2. Öffne den Editmodus
3. Füge am Ende der Liste (vor der letzten eckigen Klammer `]`) einen neuen Block hinzu:

```json
{
  "route": "Route 101",
  "p1_mon": "Geckarbor",
  "p2_mon": "Flemmli",
  "p3_mon": "Karnimani".
  "status": "alive"
}
```
Falls einer stirbt beim status "dead" eingeben
