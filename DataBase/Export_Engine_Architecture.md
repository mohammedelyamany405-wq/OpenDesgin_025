# أرشيف: محرك التصدير (Export Engine)

## 1. مسار البيانات (Data Flow)
```
SceneNode → sceneNodeToDesignNode() → tagNameForNode() → DesignNode → serializeElement() → HTML string
```

- كل عنصر في المشهد (SceneNode) يتحول إلى DesignNode (中间 AST)
- دالة `tagNameForNode()` تحدد وسم HTML للعنصر
- دالة `serializeElement()` تحول DesignNode إلى نص HTML نهائي

## 2. الملفات والدوال الرئيسية

| الملف | الدالة | الوظيفة |
|-------|--------|---------|
| `packages/dom-css/src/from-scene-graph.ts` | `tagNameForNode` | تحديد وسم HTML للعنصر (div/img/مخصص) |
| `packages/dom-css/src/from-scene-graph.ts` | `customHTMLTag` | قراءة الوسم المخصص من pluginData |
| `packages/dom-css/src/from-scene-graph.ts` | `sceneNodeToDesignNode` | تحويل SceneNode إلى DesignNode |
| `packages/dom-css/src/serialize.ts` | `serializeElement` | تحويل DesignNode إلى نص HTML |
| `packages/dom-css/src/html-export.ts` | `exportHTMLBundle` | API التصدير الرئيسي |

## 3. آلية القراءة من PluginData (محدّثة)

المفاتيح الموحدة (`pluginId = 'open-pencil'`):

| المفتاح | القيمة | مثال |
|---------|--------|------|
| `web-builder-tag` | string مباشرة | `header` |
| `web-builder-classes` | JSON array | `["container","flex-center"]` |
| `web-builder-layout` | JSON object | `{type:'flex',direction:'row',...}` |
| `web-builder-decorative` | `'true'` أو غائب | `'true'` |
| `web-builder-breakpoints` | JSON على عقدة الصفحة | `{tablet:768,mobile:375}` |

```typescript
function tagNameForNode(node: SceneNode): string {
  if (isDecorative(node)) return 'div'   // الزخرفي دائماً div
  const customTag = customHTMLTag(node)  // قراءة web-builder-tag
  if (customTag) return customTag
  const fill = node.fills.at(0)
  if ((fill?.type === 'IMAGE' || imageSourceURL(node)) && node.childIds.length === 0)
    return 'img'
  return 'div'
}
```

`attrsForNode` يضيف: `class` من `web-builder-classes` + `aria-hidden="true"` للزخرفي.
`styleFromSceneNode` يطبق `web-builder-layout` (flex/grid) قبل fallback على `layoutMode`.

## 4. تصدير اللوحة (Panel Export في WebBuilderPanel)

`generateExport` يقرأ كل عقدة طازجة عبر `readNodeMeta` (لا يعتمد على كاش التحديد):

1. بوابة الأخطاء الحرجة → منع + زر Go to Validate.
2. التحذيرات → حوار Proceed anyway / Fix first.
3. بناء HTML بالوسوم + `aria-hidden` للزخرفي.
4. بناء `<style>`:
   - تعريفات الكلاسات المستخدمة فقط (من كتالوج `classCategories`).
   - `.wb-<id>` لكل عنصر له layout معلن (flex/grid).
   - `@media (max-width)` فقط للتجاوزات المصرحة (tablet/mobile direction).

## 5. القيود والملاحظات الهامة

- **pluginId ثابت:** `open-pencil` في كل المفاتيح.
- **الافتراضي:** `div` إذا لا يوجد pluginData.
- **الأولوية:** زخرفي > وسم مخصص > image check > div.
- **لا تخمين:** media queries تُولد فقط من قيم صرح بها المصمم.
- **التوافق:** العناصر بدون pluginData تبقى div بلا كلاسات.
