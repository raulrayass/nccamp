# NC Camp - Mobile Redesign Implementation Order

## Why This Order?

1. **Phase 0 (Dark Mode)**: Safest first - just CSS, no logic changes. Tests our process.
2. **Phase 1 (Skeletons)**: Visual improvements. Safe because skeletons don't affect data.
3. **Phase 2 (Transactions)**: Data transformation only. No UI changes yet, easy to rollback.
4. **Phase 3 (Tabs)**: New UI layer on top of existing data. Desktop completely unaffected.
5. **Phase 4 (Bottom Sheets)**: Final polish. Only after everything else works.

## Each Phase Guarantees

### Phase 0: Dark Mode Fix
```
Time: 30 minutes
Risk: ZERO
Rollback: 1 line change
What we change: CSS variable in globals.css (#0a0a0a → #111111)
What we DON'T touch:
  - No JavaScript changes
  - No component changes
  - No data layer
  - No hooks
  - No actions
Testing: Visual check in dark mode only
Commit: "fix: improve dark mode card contrast"
```

### Phase 1: Skeleton Loaders & Card Styling
```
Time: 2-3 hours
Risk: LOW
Rollback: Delete 2 new files + revert 4 files
What we change:
  - NEW: skeleton-loader.tsx
  - MODIFY: ui/card.tsx (rounded-2xl styling)
  - MODIFY: 3 dashboard files (add skeleton states)
What we DON'T touch:
  - No event changing logic
  - No data fetching
  - No eventId logic
  - No modals/bottom sheets yet
Testing:
  - Dashboard loads with skeletons
  - Cards render after data arrives
  - Dark mode contrast good
  - Mobile viewport smooth
Commit: "feat: add ML-style skeleton loaders and improve card styling"
```

### Phase 2: Transaction Daily Grouping
```
Time: 1-2 hours
Risk: MEDIUM (data transformation)
Rollback: Revert 1 file
What we change:
  - MODIFY: transactions-client.tsx (add grouping logic)
What we DON'T touch:
  - No API changes
  - No database changes
  - No component structure
  - No eventId logic
Testing:
  - Transactions grouped by date correctly
  - Daily balance calculated right
  - EventId filtering still works
  - No data loss
  - Performance not degraded
Commit: "feat: group transactions by date with daily balance summary"
```

### Phase 3: Tab Navigation (Mobile Only)
```
Time: 3-4 hours
Risk: MEDIUM (new UI)
Rollback: Delete 6 new files + revert 1 file
What we change:
  - NEW: 6 section components (attendees, staff, teams, games, transactions)
  - NEW: sections-tabs.tsx switcher
  - MODIFY: dashboard-client.tsx (add tab logic with md: breakpoint)
What we DON'T touch:
  - No data layer changes
  - No event logic
  - No bottom sheets yet
  - Desktop completely unchanged (hidden by md: breakpoint)
Testing:
  - Tabs visible on mobile only (<md breakpoint)
  - Tabs hidden on desktop (md: breakpoint shows original)
  - Tab switching works
  - Data correct in each tab
  - Changing event resets tabs
  - Performance good
Commit: "feat: add tab-based navigation for mobile dashboard"
```

### Phase 4: Bottom Sheets (Mobile Modals)
```
Time: 4-5 hours
Risk: MEDIUM-HIGH (touches all modals)
Rollback: Delete 1 new file + revert 6 files
What we change:
  - NEW: mobile/bottom-sheet.tsx (responsive Dialog/Drawer)
  - MODIFY: 6 client files (attendees, staff, teams, games, transactions, settings)
           Replace Dialog with BottomSheet + add EventId safety check
What we DON'T touch:
  - No data layer
  - No event logic
  - No database
  - No API
Testing:
  - Mobile: bottom sheets slide up, close with swipe
  - Desktop: dialogs center normally (Drawer renders as Dialog md:)
  - EventId change closes sheets automatically
  - All CRUD operations work (create, edit, delete)
  - Test on real mobile device if possible
  - No data loss
  - No orphaned records
Commit: "feat: add responsive bottom sheets for mobile modals with EventId safety"
```

## Deployment Strategy

### Day 1: Phase 0 (CSS Fix)
```
1. Modify globals.css
2. Test in dev: dark mode
3. Commit & merge to main
4. Deploy
5. Monitor: should be instant, no issues
```

### Day 2-3: Phase 1 (Skeletons)
```
1. Create skeleton-loader.tsx
2. Update dashboard files
3. Test in dev: desktop + mobile
4. Test in browser: dark mode + light mode
5. Commit & merge
6. Deploy
7. Monitor: look and feel improvements
```

### Day 4: Phase 2 (Transactions)
```
1. Modify transactions-client.tsx (grouping logic)
2. Test in dev: check grouping, daily balance
3. Create test event: add fake transactions from different days
4. Verify EventId filtering still works
5. Commit & merge
6. Deploy
7. Monitor: transaction display
```

### Day 5-6: Phase 3 (Tabs)
```
1. Create 6 new section components
2. Create sections-tabs.tsx
3. Modify dashboard-client.tsx (add md: breakpoints)
4. Test in dev:
   - Mobile viewport: tabs visible, switching works
   - Desktop viewport: tabs hidden, original layout visible
5. Commit & merge
6. Deploy
7. Monitor: dashboard on mobile vs desktop
```

### Day 7-8: Phase 4 (Bottom Sheets)
```
1. Create mobile/bottom-sheet.tsx
2. Convert attendees-client.tsx first (test carefully)
3. Test:
   - Mobile: bottom sheet behavior
   - Desktop: modal behavior
   - EventId change while sheet open
   - Create/edit/delete operations
4. Convert remaining 5 files
5. Full regression testing
6. Commit & merge
7. Deploy
8. Monitor closely: this is the biggest change
```

## Rollback Plan (If Something Goes Wrong)

### Phase 0 Rollback
```
git revert <commit-hash>
Deploy
Done
```

### Phase 1 Rollback
```
git revert <commit-hash>
rm components/skeleton-loader.tsx
Deploy
```

### Phase 2 Rollback
```
git revert <commit-hash>
Deploy
```

### Phase 3 Rollback
```
git revert <commit-hash>
rm components/dashboard/sections-*.tsx
Deploy
```

### Phase 4 Rollback
```
git revert <commit-hash>
rm components/mobile/bottom-sheet.tsx
Deploy
```

## Critical Safety Checks

Before each commit, verify:
1. **EventId consistency**: Change event, confirm data updates everywhere
2. **Dark mode**: Test both dark and light mode
3. **Mobile**: Test on actual mobile device or mobile viewport
4. **Desktop**: Test on desktop - should be unchanged (phases 3+ especially)
5. **CRUD**: Create, read, update, delete at least one item per section
6. **No console errors**: Open browser dev tools, check console
7. **No orphaned data**: Delete an item, verify it's gone everywhere
8. **Performance**: Page load time not degraded, scrolling smooth

## Success Criteria Before Going to Production

- [ ] Phase 0: Dark mode looks better, no other changes
- [ ] Phase 1: Skeletons show while loading, look polished
- [ ] Phase 2: Transactions grouped by date with daily totals correct
- [ ] Phase 3: Tabs visible on mobile, desktop completely unchanged
- [ ] Phase 4: Bottom sheets work on mobile, dialogs work on desktop, EventId safety working
- [ ] All phases: No breaking changes, existing features work
- [ ] All phases: EventId context consistent throughout
- [ ] All phases: Dark mode + light mode both look good
- [ ] All phases: Desktop completely unaffected

## Questions to Ask Before Each Phase

1. **Does this change any data?** (Should be NO)
2. **Does this break desktop?** (Should be NO for phases 3+)
3. **Does this affect EventId logic?** (Should be NO except Phase 4 adds safety check)
4. **Can we rollback this independently?** (Should be YES)
5. **Are there tests we should run?** (Detailed in each phase)

## Timeline Estimate

- Phase 0: 1 day (CSS fix)
- Phase 1: 2 days (skeletons)
- Phase 2: 1 day (transaction grouping)
- Phase 3: 2 days (tabs)
- Phase 4: 3 days (bottom sheets)
- **Total: 9 days of development**

With testing and monitoring: 10-12 business days total

## What Stays the Same

Throughout ALL phases, these NEVER change:
- Event selection logic (`useEventSession`)
- Data fetching (`useTeams`, `useAttendees`, etc)
- API endpoints (`/app/actions/*`)
- Database schema
- Authentication
- Navigation bar
- FloatingDock
- Routing structure

Only UI changes - the data layer is completely untouched.
