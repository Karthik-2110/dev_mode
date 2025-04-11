# Dev Mode Lite – A Free Figma Plugin for Developer Handoff

Dev Mode Lite is a free alternative to Figma's paid Dev Mode, providing developers with tools to inspect design specs, extract CSS code, and export assets without requiring a subscription.

## Features

### 🧰 Element Inspector
- View detailed properties of any selected Figma element
- See frame dimensions, padding, borders, and more
- Copy CSS properties with a single click

### 📐 Box Model Visualization
- Interactive box model diagram showing content, padding, and border
- Accurate measurements for all sides
- Border radius and stroke weight visualization

### 💅 CSS Generation
- Auto-generated CSS for any selected element
- Properly formatted CSS properties with correct units
- Support for complex properties (shadows, blend modes, etc.)

### 📝 Text Properties
- Complete typography CSS generation
- Font family, size, weight, line height, and more
- Text alignment, decoration, and transformation

## Setup

1. Clone this repository
```
git clone https://github.com/Karthik-2110/dev_mode.git
```

2. Install dependencies
```
cd figma-dev-mode-lite
npm install
```

3. Build the plugin
```
npm run build
```

4. Load in Figma
   - Open Figma Desktop
   - Go to Plugins > Development > Import plugin from manifest
   - Select the manifest.json file from this project

## Development

- Run `npm run watch` to automatically rebuild on changes
- The UI is in `src/ui.html`
- The plugin code is in `src/code.ts`

## License

MIT 