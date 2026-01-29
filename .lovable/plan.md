
# Fix Subject Progress Cards - Exact Match to Reference

## Problem Identified
The current card width (`w-[112px]`) and container padding may not produce the exact layout shown in your reference image where:
- Exactly 3 cards are fully visible
- The 4th card is partially visible (peeking) on the right

## Root Cause Analysis
Looking at the reference image:
- Screen appears to be approximately 375-390px wide
- 3 cards + gaps + container padding must fit precisely
- Current setup: `w-[112px]` cards with `gap-3` (12px) and `px-4` (16px) padding

**Calculation:**
- Available width: ~390px viewport - 32px padding (16px each side) = 358px
- 3 cards at 112px = 336px
- 2 gaps at 12px = 24px
- Total needed: 360px (slightly larger than available)

This means cards might be too wide, causing improper fitting.

## Solution

### 1. Adjust Card Width to Match Reference Exactly
Change card width from `w-[112px]` to a calculated width that ensures exactly 3 cards fit with proper peeking:
- New width: `w-[calc((100vw-32px-24px)/3)]` on mobile OR fixed `w-[100px]`
- This ensures 3 cards + 2 gaps fit perfectly, with the 4th card naturally peeking

### 2. Technical Changes

**File: `src/pages/Home.tsx`**

Update the Subject Progress container and card classes:

```tsx
// Container - remove snap classes that may interfere, ensure proper mobile behavior
<div className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth-touch pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible">

// Each card - use calculated width for mobile
<Link 
  className="flex-shrink-0 w-[100px] md:w-auto bg-card/60 rounded-xl p-3 flex flex-col items-center gap-2 active:scale-[0.97] transition-all duration-200 border-2 ..."
>
```

### 3. Specific Code Changes

1. **Change card width**: `w-[112px]` to `w-[100px]` for tighter fit
2. **Adjust padding**: `p-4` to `p-3` inside cards for compactness
3. **Remove snap classes**: The `snap-x snap-mandatory snap-start` may be causing jumpy behavior - remove them for natural scroll
4. **Keep scrollbar hidden**: Maintain `scrollbar-hide` class

### 4. Files to Modify

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Update container classes and card width/padding |

## Expected Result
- Exactly 3 Subject Progress cards visible on mobile
- 4th card partially visible (peeking) on the right edge
- Smooth horizontal scrolling without snap behavior
- Matches your reference image exactly

