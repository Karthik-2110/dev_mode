// This is the main code that runs in the Figma environment

// Main plugin code
figma.showUI(__html__, { width: 380, height: 900 });

// Define message structure for type safety
interface PluginMessage {
  type: string;
  [key: string]: any;
}

// Function to collect all colors from a node and its children
function getAllColors(node: SceneNode) {
  let colors: any[] = [];

  // Get fills if available
  if ('fills' in node && node.fills) {
    const fills = node.fills;
    if (Array.isArray(fills)) {
      colors = colors.concat(fills.map(fill => ({
        ...fill,
        source: 'fill',
        nodeName: node.name,
        nodeType: node.type
      })));
    }
  }

  // Get strokes if available
  if ('strokes' in node && node.strokes) {
    const strokes = node.strokes;
    if (Array.isArray(strokes)) {
      colors = colors.concat(strokes.map(stroke => ({
        ...stroke,
        source: 'stroke',
        nodeName: node.name,
        nodeType: node.type
      })));
    }
  }

  // If node has children, recursively get their colors
  if ('children' in node) {
    const children = node.children;
    children.forEach(child => {
      colors = colors.concat(getAllColors(child));
    });
  }

  return colors;
}

// Function to collect all assets from a node and its children
async function getAllAssets(node: SceneNode) {
  let assets: any[] = [];

  // Helper function to get exportable elements
  async function getExportableElements(node: SceneNode): Promise<any[]> {
    let exportables: any[] = [];
    
    // Handle vectors, images, and other exportable types
    if (node.type === 'VECTOR' || node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
      try {
        const formats: ExportSettings[] = [
          { format: 'SVG', svgOutlineText: true, svgIdAttribute: false },
          { format: 'PNG', constraint: { type: 'SCALE', value: 2 } }
        ];

        const exports = await Promise.all(formats.map(async format => {
          try {
            return {
              format: format.format,
              data: await node.exportAsync(format)
            };
          } catch (error) {
            console.error(`Error exporting ${format.format}:`, error);
            return null;
          }
        }));

        const validExports = exports.filter(exp => exp !== null);
        
        if (validExports.length > 0) {
          exportables.push({
            id: node.id,
            name: node.name,
            type: node.type,
            width: node.width,
            height: node.height,
            exports: validExports
          });
        }
      } catch (error) {
        console.error('Error exporting element:', error);
      }
    }
    
    // Handle groups and frames containing exportable elements
    if (node.type === 'GROUP' || (node.type === 'FRAME' && 
        node.children.some(child => ['VECTOR', 'RECTANGLE', 'ELLIPSE'].indexOf(child.type) !== -1))) {
      try {
        const formats: ExportSettings[] = [
          { format: 'SVG', svgOutlineText: true, svgIdAttribute: false },
          { format: 'PNG', constraint: { type: 'SCALE', value: 2 } }
        ];

        const exports = await Promise.all(formats.map(async format => {
          try {
            return {
              format: format.format,
              data: await node.exportAsync(format)
            };
          } catch (error) {
            console.error(`Error exporting ${format.format}:`, error);
            return null;
          }
        }));

        const validExports = exports.filter(exp => exp !== null);
        
        if (validExports.length > 0) {
          exportables.push({
            id: node.id,
            name: node.name,
            type: node.type,
            width: node.width,
            height: node.height,
            exports: validExports
          });
        }
        
        // Don't process children individually if we exported the group
        return exportables;
      } catch (error) {
        console.error('Error exporting group:', error);
      }
    }
    
    // If node has children and wasn't exported as a group, recursively process them
    if ('children' in node) {
      for (const child of (node as ChildrenMixin).children) {
        exportables = exportables.concat(await getExportableElements(child));
      }
    }
    
    return exportables;
  }

  // Get all exportable elements from the node and its children
  assets = await getExportableElements(node);
  return assets;
}

// Function to get node properties
function getNodeProperties(node: SceneNode) {
  // Helper function to safely convert any value to a number
  const toSafeNumber = (value: any): number => {
    if (value === undefined || value === null || typeof value === 'symbol') {
      return 0;
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const properties: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    width: toSafeNumber(node.width),
    height: toSafeNumber(node.height)
  };

  // Get all colors from node and its children
  properties.allColors = getAllColors(node);

  // Get fills if available
  if ('fills' in node && node.fills) {
    properties.fills = node.fills;
  }

  // Get effects (shadows, blurs) if available
  if ('effects' in node && node.effects) {
    properties.effects = node.effects;
  }

  // Get layout properties if available
  if ('layoutMode' in node) {
    properties.layoutMode = node.layoutMode;
    properties.primaryAxisAlignItems = node.primaryAxisAlignItems;
    properties.counterAxisAlignItems = node.counterAxisAlignItems;
    properties.itemSpacing = toSafeNumber(node.itemSpacing);
  }

  // Get padding if available
  if ('paddingTop' in node) {
    properties.paddingTop = toSafeNumber(node.paddingTop);
    properties.paddingRight = toSafeNumber(node.paddingRight);
    properties.paddingBottom = toSafeNumber(node.paddingBottom);
    properties.paddingLeft = toSafeNumber(node.paddingLeft);
  }
  
  // Get border radius if available
  if ('cornerRadius' in node) {
    properties.cornerRadius = toSafeNumber(node.cornerRadius);
    
    // Get individual corner radii if available
    if ('topLeftRadius' in node) {
      properties.topLeftRadius = toSafeNumber(node.topLeftRadius);
      properties.topRightRadius = toSafeNumber(node.topRightRadius);
      properties.bottomRightRadius = toSafeNumber(node.bottomRightRadius);
      properties.bottomLeftRadius = toSafeNumber(node.bottomLeftRadius);
    }
  }
  
  // Get stroke properties if available
  if ('strokeWeight' in node) {
    properties.strokeWeight = toSafeNumber(node.strokeWeight);
    
    // Get individual stroke weights if available
    if ('strokeTopWeight' in node) {
      properties.strokeTopWeight = toSafeNumber(node.strokeTopWeight);
      properties.strokeRightWeight = toSafeNumber(node.strokeRightWeight);
      properties.strokeBottomWeight = toSafeNumber(node.strokeBottomWeight);
      properties.strokeLeftWeight = toSafeNumber(node.strokeLeftWeight);
    }
    
    // Get stroke color if available
    if ('strokes' in node && node.strokes) {
      properties.strokes = node.strokes;
    }
  }

  // Get opacity if available
  if ('opacity' in node) {
    properties.opacity = toSafeNumber(node.opacity);
  }

  // Get blend mode if available
  if ('blendMode' in node) {
    properties.blendMode = node.blendMode;
  }

  // Get text properties if the node is a text node
  if (node.type === 'TEXT') {
    const textNode = node as TextNode;
    properties.isText = true;
    properties.characters = textNode.characters;
    properties.fontSize = toSafeNumber(textNode.fontSize);
    properties.fontName = textNode.fontName;
    properties.fontWeight = textNode.fontWeight;
    properties.lineHeight = textNode.lineHeight;
    properties.letterSpacing = textNode.letterSpacing;
    properties.textAlignHorizontal = textNode.textAlignHorizontal;
    properties.textAlignVertical = textNode.textAlignVertical;
    properties.textCase = textNode.textCase;
    properties.textDecoration = textNode.textDecoration;
    properties.textAutoResize = textNode.textAutoResize;
  }

  // Get all assets from node and its children
  getAllAssets(node).then(assets => {
    properties.assets = assets;
    
    // Send updated properties to UI
    figma.ui.postMessage({
      type: 'selectionChange',
      data: properties
    });
  });

  return properties;
}

// Listen for selection changes
figma.on('selectionchange', () => {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({
      type: 'selectionChange',
      data: null
    });
    return;
  }

  // Get properties of the first selected node
  const node = selection[0];
  const nodeProperties = getNodeProperties(node);

  // Send the data to the UI
  figma.ui.postMessage({
    type: 'selectionChange',
    data: nodeProperties
  });
});

// Initial selection check
const initialSelection = figma.currentPage.selection;
if (initialSelection.length > 0) {
  const node = initialSelection[0];
  const nodeProperties = getNodeProperties(node);
  
  figma.ui.postMessage({
    type: 'selectionChange',
    data: nodeProperties
  });
}

// Function to parse resolution string into export settings
function getExportSettings(format: string, resolution: string): ExportSettings {
  if (format === 'SVG') {
    return {
      format: 'SVG',
      svgOutlineText: true,
      svgIdAttribute: false
    };
  }

  // For PNG format
  let constraint: { type: 'SCALE' | 'WIDTH' | 'HEIGHT', value: number };
  if (resolution.endsWith('x')) {
    // Scale format (e.g., '2x')
    const scale = parseFloat(resolution);
    constraint = { type: 'SCALE', value: scale };
  } else if (resolution.endsWith('w')) {
    // Width format (e.g., '512w')
    const width = parseInt(resolution);
    constraint = { type: 'WIDTH', value: width };
  } else if (resolution.endsWith('h')) {
    // Height format (e.g., '512h')
    const height = parseInt(resolution);
    constraint = { type: 'HEIGHT', value: height };
  } else {
    // Default to 1x scale
    constraint = { type: 'SCALE', value: 1 };
  }

  return {
    format: 'PNG',
    constraint: constraint
  };
}

// Handle messages from the UI
figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
  else if (msg.type === 'showToast' && typeof msg.message === 'string') {
    figma.notify(msg.message);
  }
  else if (msg.type === 'exportAsset') {
    const node = figma.getNodeById(msg.nodeId);
    if (node && 'exportAsync' in node) {
      try {
        const exportSettings = getExportSettings(msg.format, msg.resolution);
        const data = await (node as ExportMixin).exportAsync(exportSettings);
        
        figma.ui.postMessage({
          type: 'exportComplete',
          name: msg.name,
          format: msg.format,
          resolution: msg.resolution,
          data: data
        });
      } catch (error) {
        console.error('Export error:', error);
        figma.notify('Error exporting asset');
      }
    }
  }
};

// When the plugin starts with a specific command
if (figma.command === 'open-inspector') {
  // Initialize inspector
  figma.notify('Dev Mode Lite inspector is ready!');
} 