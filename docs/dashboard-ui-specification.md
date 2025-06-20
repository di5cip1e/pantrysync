# Dashboard UI Specification

## Overview
The Dashboard screen provides users with a comprehensive overview of their household's pantry and shopping activity, displaying key metrics, trends, and recent activities in a visually appealing and informative layout.

## Design System

### Color Palette
- **Primary Gradient**: `#ff6b9d` → `#c44569` → `#667eea`
- **Dark Theme**: `#0f0f23` (background), `#1a1a2e` (cards)
- **Accent Colors**: 
  - Success: `#27ae60`
  - Warning: `#f39c12`
  - Error: `#e74c3c`
  - Info: `#667eea`

### Typography
- **Header**: 28px, Bold, White
- **Card Titles**: 16px, SemiBold, White
- **Metric Values**: 32px, Bold, White
- **Body Text**: 14px, Medium, `#8e8e93`

## Layout Structure

### Header Section
- **Gradient Background**: Multi-color gradient from pink to purple to blue
- **Welcome Message**: Personalized greeting with user's first name
- **Household Name**: Current household subtitle
- **Stats Bubble**: Floating total items count with glass morphism effect

### Metrics Grid (2x2)
Four metric cards in a responsive grid layout:

1. **Total Items**
   - Icon: Package
   - Color: `#667eea`
   - Shows total pantry items count
   - Change indicator: "+12 this week"

2. **Low Stock**
   - Icon: AlertTriangle
   - Color: `#f39c12`
   - Shows items below threshold
   - Change indicator: "-3 from last week"

3. **Expiring Soon**
   - Icon: Calendar
   - Color: `#e74c3c`
   - Shows items expiring within 3 days
   - Change indicator: "+2 this week"

4. **Tasks Done**
   - Icon: CheckCircle
   - Color: `#27ae60`
   - Shows completed shopping items
   - Change indicator: "+8 this week"

### Charts Section (Side-by-side)

#### Activity Chart
- **Type**: Bar chart
- **Data**: Weekly activity levels (0-100%)
- **Interactive**: Toggle between week/month/year views
- **Highlight**: Current day with accent color
- **Labels**: Abbreviated day names

#### Spending Breakdown
- **Type**: Category list with amounts
- **Categories**: Groceries, Household, Dining, Other
- **Visual**: Colored dots for category identification
- **Currency**: USD format with proper formatting

### Recent Activity Feed
- **Layout**: Timeline-style list
- **Items**: Last 3-5 household activities
- **Elements**:
  - User avatar/initial
  - Action description
  - Timestamp (relative: "2 min ago")
  - Action icons with color coding

## Interactive Elements

### Metric Cards
- **Hover State**: Subtle elevation increase
- **Tap Feedback**: Brief scale animation
- **Data Updates**: Real-time data binding

### Chart Toggle
- **Active State**: Highlighted background (`#667eea`)
- **Inactive State**: Transparent with text color
- **Animation**: Smooth transitions between states

### Activity Items
- **Icon Styling**: Circular background with theme colors
- **Text Hierarchy**: Bold user names, regular actions
- **Spacing**: Consistent vertical rhythm

## Responsive Behavior

### Card Layout
- **Mobile**: 2 cards per row with equal spacing
- **Tablet**: 4 cards in a single row
- **Breakpoint**: Based on screen width calculations

### Chart Sizing
- **Charts**: Equal width distribution (50% each)
- **Minimum Width**: Maintains readability on small screens
- **Overflow**: Horizontal scroll if necessary

## Data Integration

### Real-time Updates
- **WebSocket Connection**: Live data synchronization
- **State Management**: React Context for global state
- **Cache Strategy**: Local cache with server sync

### Mock Data Structure
```typescript
interface DashboardData {
  totalItems: number;
  lowStockItems: number;
  expiringItems: number;
  completedTasks: number;
  weeklyActivity: number[];
  monthlySpending: {
    groceries: number;
    household: number;
    dining: number;
    other: number;
  };
  recentActivity: Activity[];
}
```

## Accessibility

### Screen Reader Support
- **Semantic Labels**: Descriptive labels for all metrics
- **Chart Descriptions**: Text alternatives for visual data
- **Navigation**: Logical tab order

### Visual Accessibility
- **Contrast Ratios**: WCAG AA compliant
- **Color Independence**: Information not solely conveyed by color
- **Text Scaling**: Supports dynamic type sizing

## Performance Considerations

### Optimization
- **Image Loading**: Lazy loading for user avatars
- **Chart Rendering**: Efficient re-renders with memoization
- **Data Fetching**: Incremental loading for large datasets

### Animation
- **Frame Rate**: 60fps smooth animations
- **Hardware Acceleration**: GPU-accelerated transforms
- **Reduced Motion**: Respects system accessibility preferences

## Error States

### Loading States
- **Skeleton Screens**: Placeholder content during load
- **Progressive Loading**: Staged content revelation
- **Timeout Handling**: Graceful degradation after timeout

### Error Handling
- **Network Errors**: Retry mechanisms with user feedback
- **Data Errors**: Fallback to cached data when available
- **Empty States**: Meaningful messages for no data scenarios