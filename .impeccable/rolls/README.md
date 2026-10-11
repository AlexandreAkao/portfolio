# Direction rolls for the home surface (2026-09-06/07)

Both rolls were run with `impeccable concept-seed --scope direction --mode experience` during the
new-work round that produced the Night Shift and Metro worlds. The `.txt` files are the script's
own output reproduced with `--from <key> --candidate-count 7` against the same catalog revision.

| World | Seed key | Assigned index | Grounded candidate built | Decision page answer |
|---|---|---|---|---|
| Night Shift (`nightshift`) | `bfa6e4a7` | 3 | Warehouse Floor (candidate 3 of 7) | `{"optionId":"assigned","steer":"","followup":true,"buildPath":"code","buildPathFlipped":false}` |
| Linha Verde / Metro (`metro`) | `ddf50991` | 3 | Subway Map Journey (candidate 3 of 7) | `{"optionId":"assigned","steer":"","buildPath":"code","buildPathFlipped":false}` |

Both rounds were presented on the serve-question decision page (key `6affb0f2`, the second round
delivered with `--update`) and both telemetry pings were sent with `--kind assigned`. The payloads
that rendered the cards are archived beside this file as `direction-a.json` and `direction-b.json`.

## Cartoon (2026-10-11)

Rolled with `impeccable concept-seed --scope direction --mode experience` for a new eighth world, the brief pinned to
1960s cartoons (key `aae49696`, assigned index 3: the Hanna-Barbera chase). The user chose Impeccable's pick, the
opening title sequence (candidate 1 of 7), through the structured question after the decision page closed unanswered;
the telemetry ping went with `--kind pick`. Challengers dealt: Dong Hồ shell-ground print, ukiyo-e block registration,
ANSI BBS, VU-meter bridge, multiplane cel dawn, Łowicz papercut (multiplane competitive; papercut and ukiyo-e declined;
the other three left in the re-roll pool). The payload is archived as `direction-cartoon.json`. Code-led: no image
generation was available.
