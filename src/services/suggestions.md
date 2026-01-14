# Autocomplete Suggestion Engine

## What it does
- Provides prefix-based suggestions from a local dictionary.
- Ranks suggestions by MRU (most-recently-used) order.
- Persists MRU list to `localStorage` (key: `autocomplete_mru_v1`).
- Deduplicates and normalizes whitespace.

## Usage

```tsx
import AutocompleteInput from './ui/AutocompleteInput';
import { DefaultSuggestionSource } from './services/suggestions';

// Minimal usage (uses default dictionary + MRU)
<AutocompleteInput
  value={value}
  onChange={setValue}
  placeholder="React, Node.js, Python..."
  className="your-input-classes"
/>

// Custom dictionary
import { createSuggestionSource } from './services/suggestions';
const mySource = createSuggestionSource(['Vue', 'Svelte', 'Angular']);

<AutocompleteInput
  value={value}
  onChange={setValue}
  source={mySource}
  delimiters={/[;,]/}   // default: /[,;•\u2022]/
  limit={6}
/>
```

## Behavior in multi-token fields
- Autocomplete works on the **current token** (after the last delimiter).
- Delimiters: `, ; • •` (Unicode bullet 2022). You can customize via `delimiters` prop.
- Selecting a suggestion replaces the current token and preserves surrounding text.

## Keyboard navigation
- `ArrowDown`/`ArrowUp`: move highlight
- `Enter`/`Tab`: select highlighted suggestion
- `Escape`: close dropdown

## Integration points
- `ResumeForm` Skills field (react-hook-form `Controller`)
- `Upload` Skills field (comma-separated parsing)
- `EditorPanel` project Tech Stack field

## Extending the dictionary
Edit `DEFAULT_DICTIONARY` in `src/services/suggestions.ts` to add/remove default suggestions.
