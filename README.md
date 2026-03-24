# 🌸 The Flower Project - Bouquet Builder

A web-based interactive tool to build custom floral bouquets using SVG layers.

live link:-

## Project Structure
- `assets/` : Contains all SVGs (Flowers, Wrappers, Ties, Canvas).
- `index.html` : The main layout and instruction panel.
- `style.css` : The "Sandwich" layering logic and aesthetic styling.
- `script.js` : The interactivity for swapping layers and adding cards.

## How to Run
1. **Open in VS Code:** Open the root folder `THE FLOWER PROJECT`.
2. **Launch Live Server:**
   - Install the **Live Server** extension in VS Code.
   - Right-click `index.html` and select **"Open with Live Server"**.
   - Your browser will open the app at `http://127.0.0.1:5500`.
3. **Adding Assets:** To add new flowers or wraps, simply drop the SVG into the corresponding `assets/` subfolder.

## Design Tips
- **Layering:** Ensure the `front` and `back` wrappers are the exact same dimensions so they align perfectly.
- **SVGs:** Keep SVGs as "Inline" if you want to change petal colors via CSS `fill` properties later.
