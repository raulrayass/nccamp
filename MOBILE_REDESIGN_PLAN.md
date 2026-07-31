# nccamp - Mobile-First Redesign Plan (Mercado Libre Style)

## Goal
Transform app to mobile-first UX with ML-inspired design, maintaining desktop functionality, preserving eventId safety, and improving dark mode contrast. No breaking changes to existing features.

## Design Philosophy
- **Base Color**: Verde (kept as primary)
- **Secondary**: Azul (actions, links)
- **Tertiary**: Amarillo (highlights, badges - for accents only)
- **Dark Mode**: Proper contrast (card bg #111111 instead of #0a0a0a)
- **Mobile UI**: Tabs + Bottom Sheets (ML-style)
- **Desktop UI**: Tabs + Dialog Modals (current pattern)
- **FloatingDock**: Preserved as-is (already good)

## Current Problems to Fix
1. ❌ Dark mode card contrast too low (#0a0a0a vs #000000)
2. ❌ Dashboard cards lack ML-inspired styling
3. ❌ No tab-based navigation (everything is in one page)
4. ❌ Modals on mobile aren't optimized (centering on small screens)
5. ❌ Transacciones section groups all transactions (no daily grouping)
6. ❌ No skeleton loaders (ML-style pulse effect)

## Safety Guarantees
- **EventId**: All new components read from useEventSession() context
- **EventId change**: If user changes event while in bottom sheet, sheet auto-closes
- **Desktop unaffected**: All desktop modals stay as Dialog (not changed to tabs)
- **Data consistency**: Same data fetching logic, just different UI

## Implementation Plan (4 Phases)

### Phase 0: Hot Fix Dark Mode (SAFE - No Logic Changes)
**Goal**: Fix contrast issue immediately without refactoring

**Files to modify:**
1. `/app/globals.css`
   - Change `--card: #0a0a0a` → `--card: #111111` (better contrast)

**Validation:**
- Test in dark mode: cards should be clearly visible
- Test in light mode: should look same as before
- **Risk**: None (only CSS variable change)

---

### Phase 1: Skeleton Loaders & Card Styling
**Goal**: ML-inspired skeleton loaders and card design improvements

**Files to create:**
1. `/components/skeleton-loader.tsx` - Reusable skeleton component with pulse animation

**Files to modify:**
1. `/components/ui/card.tsx` - Update Card component styling (rounded-2xl, better shadows)
2. `/components/dashboard/game-stats-card.tsx` - Add skeleton state
3. `/components/dashboard/stats-section.tsx` - Add skeleton loading state
4. `/components/dashboard-client.tsx` - Show skeletons while loading

**Changes in detail:**
- Skeleton pulse effect: Tailwind animate-pulse with gradient shimmer
- Card styling: rounded-2xl (instead of default), shadow-sm in light, shadow-none in dark
- Responsive padding: px-4 md:px-6 (mobile first)

**Validation:**
- Skeletons show while loading
- Cards render properly after load
- Dark mode still has good contrast
- **Risk**: Low (only visual improvements)

---

### Phase 2: Transactiones - Daily Grouping & Balance Summary
**Goal**: Group transactions by date, show daily balance like ML Mercado Pago

**Files to modify:**
1. `/components/transactions-client.tsx`
   - Group transactions by date using `toLocaleDateString()`
   - Add "Saldo del día" section for each date group
   - Calculate: sum of transactions for that day

**Implementation detail:**
```typescript
const grouped = transactions.reduce((acc, t) => {
  const date = new Date(t.date).toLocaleDateString('es-ES')
  if (!acc[date]) acc[date] = []
  acc[date].push(t)
  return acc
}, {})
```

**Validation:**
- Transactions grouped correctly by date
- Daily balance calculation correct
- EventId filtering still works
- **Risk**: Low (transformation only, no data changes)

---

### Phase 3: Tab Navigation Layout (Dashboard Only)
**Goal**: Add tabs (Attendees, Staff, Teams, Games, Transacciones) - ML style

**Files to create:**
1. `/components/dashboard/sections-tabs.tsx` - Tab switcher component
2. `/components/dashboard/attendees-section.tsx` - Attendees mobile view
3. `/components/dashboard/staff-section.tsx` - Staff mobile view
4. `/components/dashboard/teams-section.tsx` - Teams mobile view
5. `/components/dashboard/games-section.tsx` - Games mobile view
6. `/components/dashboard/transactions-section.tsx` - Transactions grouped by date

**Modify:**
1. `/components/dashboard-client.tsx`
   - Import SectionsTabs component
   - Desktop (`md:`): Keep current layout, hide tabs
   - Mobile (`<md`): Show tabs instead of all stats

**Implementation approach:**
- Use URL search params: `?section=attendees` (no routing, just UI state)
- `useEventSession()` provides eventId for all sections
- Each section uses same data fetching hooks

**Validation:**
- Tabs switch correctly
- EventId consistent across tabs
- Desktop: tabs hidden, original layout preserved
- Mobile: tabs show, sections render
- **Risk**: Low-medium (new UI, same data layer)

---

### Phase 4: Bottom Sheets for Mobile (Modals Optimization)
**Goal**: Replace Dialog centering with bottom sheets on mobile

**Files to create:**
1. `/components/mobile/bottom-sheet.tsx` - New component extending Drawer

**Modify modals to use BottomSheet:**
1. `/components/attendees-client.tsx` - Dialog → BottomSheet
2. `/components/staff-client.tsx` - Dialog → BottomSheet
3. `/components/teams-client.tsx` - Dialog → BottomSheet
4. `/components/games-client.tsx` - Dialog → BottomSheet
5. `/components/transactions-client.tsx` - Dialog → BottomSheet
6. `/components/settings-client.tsx` - Dialog → BottomSheet

**EventId Safety Check (NEW):**
```typescript
const { eventId: contextEventId } = useEventSession()
const [sheetEventId, setSheetEventId] = useState<number | null>(null)

useEffect(() => {
  if (sheetEventId && contextEventId !== sheetEventId) {
    setSheetOpen(false)
    toast.info('Evento cambió')
  }
}, [contextEventId, sheetEventId])
```

**Validation:**
- Mobile: bottom sheets animate up
- Desktop: dialogs center normally
- EventId change closes sheets
- All existing functionality preserved
- **Risk**: Medium (UI refactor, needs testing on mobile)

---

## Rollout Strategy

### Sprint 1: Phase 0 + Phase 1 (Safe, No Logic Changes)
1. Deploy dark mode fix (CSS only)
2. Add skeletons to dashboard
3. Test: Everything works, looks better
4. Commit & merge

### Sprint 2: Phase 2 + Phase 3 (New UI, Same Data)
1. Add transaction grouping by date
2. Add tab navigation to dashboard
3. Test: Tabs work on mobile, desktop unaffected
4. Commit & merge

### Sprint 3: Phase 4 (Mobile UX Optimization)
1. Create BottomSheet component
2. Convert components one by one
3. Test EventId safety
4. Commit & merge

## Testing Checklist per Phase

### Phase 0
- [ ] Dark mode: cards visible and contrasted
- [ ] Light mode: looks same as before
- [ ] All pages load without errors

### Phase 1
- [ ] Dashboard shows skeletons while loading
- [ ] Cards render after load
- [ ] Dark mode still has good contrast

### Phase 2
- [ ] Transactions grouped by date
- [ ] Daily balance calculated correctly
- [ ] EventId filtering still works

### Phase 3
- [ ] Tabs render on mobile only
- [ ] Switching tabs shows correct data
- [ ] Desktop: tabs hidden, original layout visible
- [ ] Data consistent across tabs

### Phase 4
- [ ] Bottom sheets animate up on mobile
- [ ] Swipe down closes sheet
- [ ] Desktop: modals center normally
- [ ] EventId change closes sheet
- [ ] All CRUD operations work

## Files Summary

### Files to CREATE (12 new files)
```
/components/skeleton-loader.tsx
/components/mobile/bottom-sheet.tsx
/components/dashboard/sections-tabs.tsx
/components/dashboard/attendees-section.tsx
/components/dashboard/staff-section.tsx
/components/dashboard/teams-section.tsx
/components/dashboard/games-section.tsx
/components/dashboard/transactions-section.tsx
```

### Files to MODIFY (11 existing files)
```
Phase 0: /app/globals.css
Phase 1: /components/ui/card.tsx, /components/dashboard-client.tsx
Phase 2: /components/transactions-client.tsx
Phase 3: /components/dashboard-client.tsx
Phase 4: 6 client components
```

### Files to KEEP UNCHANGED (Critical)
```
/lib/contexts/event-session-context.tsx
/app/actions/* (all data layer)
/lib/hooks/* (all data fetching)
/components/navbar.tsx
/components/select-event-client.tsx
```

## Success Metrics
- ✅ All phases deploy without breaking existing features
- ✅ Dark mode looks good (better contrast)
- ✅ Mobile UX improved (tabs + bottom sheets)
- ✅ Desktop UX unchanged
- ✅ EventId consistency maintained
- ✅ No data loss or orphaned records
- ✅ All CRUD operations functional

## Risk Mitigation
- Start with Phase 0 (CSS only) - safest first step
- Use `md:` Tailwind breakpoint to hide mobile-only UI
- Add EventId context checks in BottomSheet
- Test each phase independently before moving to next
- Keep fallback Dialog in BottomSheet component
- No database changes needed
- No API changes required
- Can rollback any phase independently
