# Design System Documentation: Tactical Retro-Futurism

## 1. Overview & Creative North Star
### The Creative North Star: "The Analog Terminal"
This design system rejects the "glossy" future of mainstream sci-fi in favor of a heavy, industrial, and humane retro-futurism. Inspired by the CRT-driven aesthetics of 1970s aerospace tech and high-end modern developer environments, this system prioritizes focus, legibility, and tactile weight. It is designed for "long-haul" digital endurance—creating an environment that feels like a physical workstation rather than a flat screen.

We achieve a high-end editorial feel by breaking the rigid, predictable web grid through intentional asymmetry, mono-spaced data density, and a "low-res luxury" approach. We are not just building an interface; we are skinning a high-performance tactical instrument.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep obsidian and muted slates to reduce eye strain, punctuated by high-chroma signals for critical path navigation.

### The Color Palette
- **Background & Surface:** The foundation is built on `surface` (#131316) and `surface_container_lowest` (#0E0E11). These create a "void" that allows technical data to pop without glare.
- **The Accents:** `primary_container` (#00F0FF) is reserved for "Actionable/Live" states. `tertiary_container` (#FF003C) is the "Critical/Warning" signal. 
- **Muted Slate:** `on_secondary_container` (#B3B7CF) provides a bridge between the void and the data, used for secondary information that shouldn't compete with primary signals.

### The "No-Line" Rule
To elevate this beyond a generic "boxed" UI, designers are **prohibited from using 1px solid borders for sectioning.** Structural boundaries must be defined solely through background color shifts. 
- A sidebar should sit on `surface_container_low` while the main stage sits on `surface`. 
- Use the **Nesting Principle**: A card or module should be defined by moving from a lower-tier surface (e.g., `surface_container_low`) to a higher-tier surface (e.g., `surface_container_high`).

### The "Glass & Scanline" Rule
To create the "tactile terminal" feel, floating elements (modals, tooltips) must use **Glassmorphism**. Apply a semi-transparent `surface_variant` with a `backdrop-blur` of 12px. Overlay these elements with a subtle, repeating 2px scanline texture at 5% opacity to mimic a CRT phosphorus screen.

---

## 3. Typography: The Industrial Monospace
We utilize two distinct monospace typefaces to create an authoritative, technical hierarchy.

- **Headers & Display:** **Space Mono** (Uppercase, Tracking 0.1em). This is our "command" font. Use it for `display-lg` through `headline-sm`. The increased tracking is mandatory to maintain an editorial, high-end feel and avoid the "crowded" look of standard monospace headers.
- **Technical Data & Body:** **JetBrains Mono**. This font is designed for high-density reading. Use it for all `body`, `title`, and `label` roles. It provides the "Developer Tool" precision required for tactical environments.

**Editorial Hierarchy:**
- Use `display-lg` (3.5rem) sparingly for section starts, often offset to the left or right to create intentional asymmetry.
- Micro-labels (`label-sm`) should always be in Space Mono/Uppercase to act as "metadata" for larger blocks of JetBrains Mono body text.

---

## 4. Elevation & Depth: Tonal Layering
In this system, depth is a product of light and material, not drop shadows.

- **Tonal Layering:** Avoid shadows for static elements. Instead, "stack" the surface-container tiers. For example, a `surface_container_lowest` element on a `surface` background creates a "recessed" look, while `surface_container_highest` creates a "raised" look.
- **The "Ghost Border" Fallback:** If a container requires further definition for accessibility, use a **Ghost Border**. This is a 1px solid line using `outline_variant` at **15% opacity**. Never use a 100% opaque border; it breaks the "humane" atmosphere.
- **Ambient Shadows:** For "floating" tactical overlays, use an extra-diffused shadow: `blur: 40px`, `opacity: 8%`, using a tinted shadow color derived from `surface_tint`.

---

## 5. Components

### Buttons (Tactical Trigger)
- **Primary:** `primary_container` (#00F0FF) background with `on_primary_container` text. Square corners (0px radius). No gradients. Hover state should include a subtle "flicker" animation or a shift to 100% opacity.
- **Secondary:** `surface_variant` background with a 1px "Ghost Border" of `primary`. 
- **Interaction:** All buttons should feel like "switches." Use a 50ms transition to mimic the instantaneous nature of hardware.

### Input Fields
- **Styling:** Underline-only or subtle background shift to `surface_container_high`. 
- **Focus State:** When active, the entire background of the input should pulse slightly with a 2% opacity of the `primary` color. The cursor should be a solid block, mimicking a terminal prompt.

### Lists & Data Grids
- **The Divider Rule:** Strictly forbid the use of horizontal divider lines. 
- **Separation:** Use the Spacing Scale (e.g., `spacing-4` / 0.9rem) to create clear groupings. Use a subtle background shift on hover to highlight rows.

### Chips & Tags
- **Tactical Labels:** These should look like hardware-stamped labels. Use `label-sm` (Space Mono), 0px border radius, and `secondary_container` background.

### Tactical HUD (Additional Component)
- A "Status Bar" component fixed to the top or bottom of the screen using `surface_container_lowest` and a constant 3% scanline texture. This houses environmental data and system status in `label-sm` JetBrains Mono.

---

## 6. Do’s and Don’ts

### Do:
- **Embrace Asymmetry:** Place technical metadata (timestamps, version numbers) in the corners of containers to break the "centered" web look.
- **Use Data Density:** It’s okay to have a lot of information on screen, provided it is perfectly aligned to the 0.4rem spacing grid.
- **High Contrast Navigation:** Ensure your primary action is always in the neon `primary_container` color to guide the eye through the dark environment.

### Don’t:
- **No Rounded Corners:** Any radius above 0px is a violation of the system's industrial soul.
- **No Generic Gradients:** Avoid "Instagram-style" vibrant gradients. If color transitions are used, they must be "stepped" or extremely subtle tonal shifts within the same hue.
- **No Traditional Shadows:** Standard 0.2 alpha black shadows will make the system look like a generic dashboard. Stick to tonal layering.