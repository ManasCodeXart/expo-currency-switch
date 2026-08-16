# expo-currency-switch

A fintech currency switcher live rates, bidirectional amount input, and fluid motion throughout.

<img width="1280" height="720" alt="km_20260816-1_1080p_30f_20260816_131240-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/3f056a85-6da1-4fb8-af05-7d4a0f2f9f3e" />



---

## ✨ Features

- 💱 **Bidirectional amount input** — edit either the send or receive field; the opposite amount updates live from the current exchange rate
- 🔄 **Spring-physics card swap** — from/to currencies animate past each other with a double-tap guard so rapid taps never corrupt state
- 🌍 **Live exchange rates** — fetches from the [Frankfurter API](https://frankfurter.dev) out of the box, with a 15-minute in-memory cache and stale-request cancellation
- 🔌 **Injectable rate source** — swap out Frankfurter for any backend by passing a `fetcher` function; or skip the network entirely by passing `rate` directly as a prop
- 🎭 **Morph-transition picker** — the currency dropdown spring-scales from its pill anchor on open and collapses back on dismiss, no jarring cuts
- 🔍 **Searchable currency list** — filter by code or country name, with a double-select guard
- 📐 **Adaptive amount typography** — font size steps down across four buckets as digit count grows, so wide values never overflow the card
- 🧠 **TypeScript-first** — fully typed props, `ExchangeRateFetcher` as a named injectable type, structured `onSend` detail object

---

## ⚙️ Installation

This isn't published as an npm package yet — copy the source directly into your project.

```bash
git clone https://github.com/ManasCodeXart/expo-currency-switch.git
```

Copy `components/`, `constants/`, `hooks/`, `providers/`, and `utils/` from `src/` into your project, then install the peer dependencies:

```bash
npx expo install react-native-reanimated react-native-worklets react-native-svg
```

> Reanimated 4.x ships its worklets runtime as the separate `react-native-worklets` package — it's required alongside `react-native-reanimated`, not optional.

> Requires `react-native-reanimated`'s Babel plugin already configured. No `react-native-gesture-handler` needed for this component.

---

## 🚀 Usage

```tsx
import { CurrencySwitcher } from './components/CurrencySwitcher';

export function PaymentScreen() {
  return (
    <CurrencySwitcher
      onCurrencyChange={(from, to) => console.log(from.code, '→', to.code)}
      onSend={(details) => console.log('Send', details)}
    />
  );
}
```

### Bring your own rate source

```tsx
// Pass a static or externally-fetched rate — skips the Frankfurter fetch entirely
<CurrencySwitcher
  rate={83.12}
  isRateLoading={false}
  onSend={(details) => sendPayment(details)}
/>
```

```tsx
// Or inject a custom fetcher (e.g. your own backend) directly into the hook
import { useExchangeRate } from './hooks/useExchangeRate';

const { rate, isLoading, error, refresh } = useExchangeRate('USD', 'INR', {
  fetcher: (base, target) => myApi.getRate(base, target),
  cacheTtlMs: 5 * 60 * 1000,
});
```

## Preview



https://github.com/user-attachments/assets/87ff401a-4c82-4409-ab15-6ae1a4d3aa6f



---

## 🧱 Component Anatomy

```
<CurrencySwitcher>
  ├─ CurrencyPicker     (morph-transition currency search dropdown)
  │   └─ CurrencyRow    (flag + code + name + selection row)
  └─ SwapIcon           (bidirectional arrow icon)
```

`CurrencyPicker` and `CurrencyRow` are also exported individually if you need them outside the switcher.

---

## 🧩 API

### `<CurrencySwitcher>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `currencies` | `readonly Currency[]` | built-in list | The currency list shown in both pickers. |
| `defaultFromCurrency` | `Currency` | `USD` | Currency shown in the send card on first render. |
| `defaultToCurrency` | `Currency` | `INR` | Currency shown in the receive card on first render. |
| `defaultSendAmount` | `string` | `"300"` | Amount pre-filled in the send field on first render. |
| `rate` | `number` | — | Pass an explicit rate to skip the internal Frankfurter fetch entirely. |
| `isRateLoading` | `boolean` | — | When using an external `rate`, set this while your rate loads to show the "Fetching…" state. |
| `fee` | `number` | `76.87` | Transaction fee displayed in the info section. |
| `arrivalEstimate` | `string` | `"By Friday"` | Arrival estimate string displayed in the info section. |
| `swapIcon` | `ReactNode` | built-in `<SwapIcon />` | Replace the swap button icon with any node. |
| `style` | `StyleProp<ViewStyle>` | — | Additional styles applied to the root container. |
| `onAmountChange` | `(amount: string) => void` | — | Fires on every keystroke with the implied send-side amount as a string. |
| `onCurrencyChange` | `(from: Currency, to: Currency) => void` | — | Fires when either currency is changed or the cards are swapped. |
| `onSend` | `(details: { amount: number; from: Currency; to: Currency }) => void` | — | Fires on Send tap with the current send amount and both currencies. |

### `<CurrencyPicker>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | — | Controls open/close. Morph-animates in and out automatically. |
| `anchorPosition` | `AnchorPosition \| null` | — | Screen position of the pill that triggered the picker, used to anchor the dropdown. |
| `selectedCode` | `string` | — | The currently selected currency code. Highlighted in the list. |
| `currencies` | `readonly Currency[]` | — | The full list to render and filter. |
| `onSelect` | `(currency: Currency) => void` | — | Fired once per selection; double-select is guarded internally. |
| `onClose` | `() => void` | — | Fired on backdrop tap or after a selection. |

### `useExchangeRate`

```ts
const { rate, isLoading, error, refresh } = useExchangeRate(base, target, options);
```

| Option | Type | Default | Description |
|---|---|---|---|
| `fetcher` | `ExchangeRateFetcher` | Frankfurter | Any `(base, target) => Promise<number>` function. |
| `cacheTtlMs` | `number` | `900000` (15 min) | How long a cached rate is considered fresh before the next mount triggers a refetch. |
| `enabled` | `boolean` | `true` | Set to `false` to skip fetching entirely — used internally when the `rate` prop is provided. |

### Types

```ts
interface Currency {
  readonly code: string;
  readonly symbol: string;
  readonly name: string;
  readonly countryCode: string; // ISO 3166-1 alpha-2, used for flag CDN lookup
}

type ExchangeRateFetcher = (base: string, target: string) => Promise<number>;

interface AnchorPosition {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}
```

---

## 🔤 Fonts

Text elements use the **Space Grotesk** family (`SpaceGroteskMedium`, `SpaceGroteskSemiBold`, `SpaceGroteskBold`) by name. If you don't load these yourself via `expo-font` / `useFonts`, React Native falls back to the system font silently — everything still works, you'll just get system-font weights instead of Space Grotesk. Load the family under those exact names if you want the intended look.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

## 🧱 Stack

[Expo SDK 57](https://expo.dev/changelog) · [React Native 0.86](https://reactnative.dev/) · [Reanimated 4.5](https://docs.swmansion.com/react-native-reanimated/) · [React Native Worklets 0.10](https://docs.swmansion.com/react-native-reanimated/) · [react-native-svg 15.15](https://github.com/software-mansion/react-native-svg)
