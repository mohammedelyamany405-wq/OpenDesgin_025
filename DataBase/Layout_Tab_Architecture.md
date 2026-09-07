# Layout Tab — Architecture

## 1. Components

| File | Purpose |
|------|---------|
| `src/components/properties/web-builder/LayoutTab.vue` | Flex/Grid layout controls |
| `src/components/properties/web-builder/WebBuilderPanel.vue` | Tab host (imports LayoutTab) |
| `packages/dom-css/src/from-scene-graph.ts` | Export engine (reads layout from pluginData) |

## 2. Data Model

**pluginData key:** `web-builder-layout`  
**pluginId:** `open-pencil`

```json
{
  "type": "flex|grid|none",
  "direction": "row|column",
  "justifyContent": "flex-start|center|flex-end|space-between|space-around|space-evenly",
  "alignItems": "stretch|flex-start|center|flex-end|baseline",
  "gap": "16px",
  "flexWrap": true,
  "gridTemplateColumns": "1fr 1fr 1fr",
  "gridTemplateRows": "auto",
  "childFlexGrow": 1,
  "childFlexShrink": 0,
  "childFlexBasis": "auto",
  "childAlignSelf": "center"
}
```

## 3. Export Engine Logic

In `from-scene-graph.ts`, `styleFromSceneNode()`:

1. Check `webBuilderLayout(node)` from pluginData
2. If `type === 'flex'`: generate `display: flex` + direction/justify/align/gap/wrap
3. If `type === 'grid'`: generate `display: grid` + columns/rows/gap
4. If no pluginData layout: fall back to built-in `layoutMode` (existing behavior)

## 4. API Used

- Read selected node: `useSelectionState().selectedNode`
- Read pluginData: `node.pluginData.find(e => e.pluginId === 'open-pencil' && e.key === 'web-builder-layout')`
- Save to pluginData: `editor.updateNodeWithUndo(nodeId, { pluginData }, 'Set layout')`
- Editor store: `useEditorStore()`

## 5. Integration Points

- **DOM Tree Tab**: Reads tags from pluginData (independent of layout)
- **Pages Tab**: Manages pages (independent of layout)
- **Export Tab**: Generates HTML using layout CSS from pluginData
- **Design Panel**: WebBuilderPanel shows only when element is selected

## 6. CSS Output Examples

### Flex Row
```css
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
gap: 16px;
```

### Flex Column with Wrap
```css
display: flex;
flex-direction: column;
gap: 20px;
flex-wrap: wrap;
```

### Grid 3 Columns
```css
display: grid;
grid-template-columns: 1fr 1fr 1fr;
gap: 20px;
```
