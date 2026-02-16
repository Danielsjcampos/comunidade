# Task: Implement Calendar Navigation for Dashboard

## Problem
Currently, the `Dashboard` shows all available Saturday slots in a long list. Users need a more intuitive way to navigate between specific dates using a calendar interface, as seen in the provided reference images.

## Solution
Implement a `CalendarSelector` component that allows users to pick a specific Saturday. The dashboard will then filter the slots to show only those for the selected date, or scroll to the selected date.

## Implementation Steps

### Phase 1: Planning & Design
1.  **Analyze current Dashboard layout:** Integrate a calendar button or a horizontal date picker in the header.
2.  **Define Calendar behavior:** 
    - Full-month view (like image 2 reference).
    - Highlight Saturdays.
    - Disable non-Saturday dates (or just allow clicking anything and show "No events").
3.  **State Management:** Add `selectedDate` state to `Dashboard.tsx`.

### Phase 2: Component Development
1.  **Create `CalendarSelector` component:**
    - Use `lucide-react` or `material-symbols`.
    - Build a grid of days.
    - Style with Navy/Mint theme.
2.  **Create `CalendarModal`:** To house the calendar on mobile or as a dropdown on desktop.

### Phase 3: Integration
1.  **Update `Dashboard.tsx`:**
    - Add `selectedDate` state.
    - Add the Calendar trigger in the header.
    - Update the list to filter/scroll based on `selectedDate`.
2.  **Smooth scrolling:** Ensure that selecting a date scrolls the user to the correct section.

### Phase 4: Polish
1.  **Animations:** Use `framer-motion` for the calendar transitions.
2.  **Accessibility:** Ensure keyboard navigation.

## Verification Criteria
- [ ] Calendar opens when clicking the calendar icon.
- [ ] Saturdays are clearly marked.
- [ ] Clicking a Saturday updates the Dashboard view to show that day's slots.
- [ ] UI matches the "Comunidade" premium aesthetic (Glassmorphism, Navy, Mint).
