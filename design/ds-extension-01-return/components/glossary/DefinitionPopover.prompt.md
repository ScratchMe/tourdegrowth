Use `DefinitionPopover` with `DefinitionTrigger`. Content comes from `content/glossary.js` — 15 terms, verbatim; do not paraphrase a definition into the component.

```jsx
<DefinitionPopover placement="anchored" term="Activation" definition={glossary.activation.fr} />
<DefinitionPopover placement="docked" term="Moment « aha »" definition={…} onClose={close} />
```

Only one popover open at a time in the whole app. Close on outside click, Escape, and a second press on the trigger. Below 640px always use `docked` — a 280px anchored panel overflows one side of a 390px screen no matter how it is positioned.
