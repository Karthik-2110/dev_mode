// This is the main code that runs in the Figma environment

// Main plugin code
figma.showUI(__html__, { width: 380, height: 500 });

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

// Function to get node properties
function getNodeProperties(node: SceneNode) {
  const properties: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    width: node.width,
    height: node.height
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
    properties.itemSpacing = node.itemSpacing;
  }

  // Get padding if available
  if ('paddingTop' in node) {
    properties.paddingTop = node.paddingTop;
    properties.paddingRight = node.paddingRight;
    properties.paddingBottom = node.paddingBottom;
    properties.paddingLeft = node.paddingLeft;
  }
  
  // Get border radius if available
  if ('cornerRadius' in node) {
    properties.cornerRadius = node.cornerRadius;
    
    // Get individual corner radii if available
    if ('topLeftRadius' in node) {
      properties.topLeftRadius = node.topLeftRadius;
      properties.topRightRadius = node.topRightRadius;
      properties.bottomRightRadius = node.bottomRightRadius;
      properties.bottomLeftRadius = node.bottomLeftRadius;
    }
  }
  
  // Get stroke properties if available
  if ('strokeWeight' in node) {
    properties.strokeWeight = node.strokeWeight;
    
    // Get individual stroke weights if available
    if ('strokeTopWeight' in node) {
      properties.strokeTopWeight = node.strokeTopWeight;
      properties.strokeRightWeight = node.strokeRightWeight;
      properties.strokeBottomWeight = node.strokeBottomWeight;
      properties.strokeLeftWeight = node.strokeLeftWeight;
    }
    
    // Get stroke color if available
    if ('strokes' in node && node.strokes) {
      properties.strokes = node.strokes;
    }
  }

  // Get opacity if available
  if ('opacity' in node) {
    properties.opacity = node.opacity;
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
    properties.fontSize = textNode.fontSize;
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

// Handle messages from the UI
figma.ui.onmessage = msg => {
  if (msg.type === 'cancel') {
    figma.closePlugin();
  }
  if (msg.type === 'showToast') {
    figma.notify(msg.message);
  }
};

// When the plugin starts with a specific command
if (figma.command === 'open-inspector') {
  // Initialize inspector
  figma.notify('Dev Mode Lite inspector is ready!');
} 