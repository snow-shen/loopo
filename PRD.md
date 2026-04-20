# DJ Strudel — PRD

## One-liner
A fake DJ booth in the browser. Pick a beat, spin the record, push the faders. Under the hood it's Strudel live-coded music; on top it looks like a turntable.

## Why
- Strudel makes incredible generative beats but the code-first UI scares non-coders.
- Beginners, streamers, and people who just want "a simple dynamic beat" when they go live need a toy, not an IDE.
- A visual DJ metaphor (turntable + faders) lowers the barrier to zero while keeping the music powerful.

## Who it's for
- **Streamers / creators** who want a royalty-free, never-loops beat while going live.
- **Beginners curious about Strudel** — a visual entry point before touching code.
- **Anyone who wants 30 seconds of fun** spinning a fake DJ set.

## MVP scope (v1, ship this)
One deck. Three curated templates (coastline / broken cut / acidic tooth). Three faders (tempo / filter / volume). Play-stop. Spinning vinyl animation that actually reacts to playback. Dark, minimal, one-page. Nothing else.

**Non-goals for v1:**
- No two-deck mixing, no crossfader.
- No LLM beat generation.
- No saving, accounts, sharing.
- No effects beyond the three faders.
- No editing the code. (Read-only preview is OK.)

## Features (v1)

### Turntable
- A vinyl record centered on the page. Spins when playing, still when stopped.
- Center label shows the current template name.
- Click the record → play/pause.

### Template picker
- Three pills above the turntable: coastline, broken cut, acidic tooth.
- Click = load that template (swaps the beat live if already playing).

### Faders
- **TEMPO** — 0.5× to 2× of template's default cps. Default 1.0.
- **FILTER** — master low-pass cutoff, 200Hz → 20kHz. Default full-open.
- **VOLUME** — master gain 0 → 1.5. Default 0.8.
- All faders apply live: slide → pattern re-evaluates with new params and continues from current cycle (Strudel handles this).

### Code preview (collapsible)
- Small "view code" toggle. Shows the actual Strudel code being played. Read-only. Copy button.
- Exists so curious users can peek under the hood and eventually graduate to the real Strudel REPL.

## Tech
- Single static HTML page. No build step, no server required (local server only if samples need CORS).
- `@strudel/web` loaded from unpkg CDN.
- Templates stored as `{ setup, pattern, defaultCps }` — we assemble the final code string with user params substituted, then `evaluate()`.
- Vinyl animation: pure CSS (`@keyframes spin`, paused via class toggle).

## Future phases (not now, but shape v1 so these fit)
1. **More templates.** Curated pack of 10-20 genres (house / dnb / lofi / ambient).
2. **LLM beat generator.** "Generate me a chill lo-fi beat" → produces new Strudel code. (Open problem: LLMs don't know Strudel well yet — need a skill/system prompt trained on Strudel docs and a verifier that the code runs.)
3. **Chrome extension / desktop player.** Go-live mode: floating mini-player over OBS/Zoom.
4. **Two-deck mixer.** Real crossfade between two Strudel patterns.
5. **Share your set.** URL-encoded deck state so you can send a friend your mix.
6. **"Spotify for Strudel"** — community library of beats, browse by mood/genre/BPM.

## The "LLM doesn't know Strudel" problem
This is the biggest future-phase risk. Strudel is niche enough that even good models make up syntax. Before phase 2, we need:
- A curated corpus of working Strudel snippets (the templates are seed #1).
- A sandbox that validates generated code actually produces sound before surfacing it.
- Probably a Claude skill with Strudel docs stuffed in.

For v1: ignore. Use templates. Get the toy shipped.

## Success signal for v1
A non-coder opens the page, clicks a template, hits play, pushes the filter fader up and down, and goes "oh this is fun." That's it.
