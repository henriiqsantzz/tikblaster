# TikBlaster UI Components Guide

This guide demonstrates how to use all the UI components created for the TikBlaster TikTok Ads management SaaS.

## Component Overview

All components are located in `/src/components/ui/` and can be imported from the barrel export:

```tsx
import {
  Button,
  Card,
  Input,
  Select,
  TextArea,
  Badge,
  Modal,
  Table,
  LoadingSpinner,
  Skeleton,
  SkeletonCard,
  PageLoader,
  Toggle,
  Tabs,
} from '@/components/ui';
```

---

## 1. Button Component

Versatile button component with multiple variants and sizes.

### Variants
- **primary** (default): Brand green (#00e6a0) - primary actions
- **secondary**: Dark background - secondary actions
- **danger**: Red background - destructive actions
- **ghost**: Transparent - minimal actions

### Sizes
- **sm**: Small (12px text, 1.5px padding)
- **md**: Medium (14px text, 2px padding) - default
- **lg**: Large (18px text, 3px padding)

### Features
- Loading state with spinner
- Disabled state
- Focus ring styling
- Smooth transitions

### Usage Examples

```tsx
// Primary button
<Button variant="primary" size="md">
  Launch Campaign
</Button>

// Secondary button
<Button variant="secondary">
  Cancel
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
  Delete Campaign
</Button>

// Ghost button
<Button variant="ghost">
  Learn More
</Button>

// Loading state
<Button loading>
  Saving...
</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

---

## 2. Card Component

Dark glass-morphism card with optional header and actions.

### Props
- **title** (optional): Card header title
- **subtitle** (optional): Subtitle text
- **icon** (optional): Icon for the header
- **actions** (optional): Action buttons/controls for the header

### Usage Examples

```tsx
// Simple card
<Card>
  Campaign data goes here
</Card>

// Card with title and subtitle
<Card title="Active Campaigns" subtitle="Last 30 days">
  Your campaign content
</Card>

// Card with icon and actions
<Card
  title="Campaign Analytics"
  icon={<AnalyticsIcon />}
  actions={
    <Button size="sm" variant="ghost">
      More
    </Button>
  }
>
  <div className="space-y-4">
    {/* Analytics data */}
  </div>
</Card>
```

---

## 3. Input Components

Three input components with dark theme styling.

### Input (Text/Number)

```tsx
// Basic input
<Input
  type="text"
  placeholder="Campaign name"
/>

// With label and error
<Input
  label="Campaign Name"
  type="text"
  placeholder="Enter campaign name"
  error={errors.name}
/>

// With icon
<Input
  label="Budget"
  type="number"
  icon={<DollarIcon />}
  placeholder="0.00"
/>
```

### Select

```tsx
<Select
  label="Campaign Status"
  options={[
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PAUSED', label: 'Paused' },
    { value: 'COMPLETED', label: 'Completed' },
  ]}
  error={errors.status}
/>
```

### TextArea

```tsx
<TextArea
  label="Campaign Description"
  placeholder="Enter campaign description"
  rows={4}
  error={errors.description}
/>
```

---

## 4. Badge Component

Status badge with predefined status types.

### Status Types
- **ACTIVE**: Green (#00e6a0)
- **PAUSED**: Yellow (#f59e0b)
- **ERROR**: Red (#ef4444)
- **PENDING**: Blue (#3b82f6)

### Features
- Colored dot indicator
- Rounded pill shape
- Inline display

### Usage Examples

```tsx
// Active campaign
<Badge status="ACTIVE">Active</Badge>

// Paused campaign
<Badge status="PAUSED">Paused</Badge>

// Error status
<Badge status="ERROR">Failed</Badge>

// Pending approval
<Badge status="PENDING">Pending Review</Badge>

// In a table cell
<td>
  <Badge status={campaign.status}>
    {campaign.statusLabel}
  </Badge>
</td>
```

---

## 5. Modal Component

Centered modal dialog with overlay and close button.

### Props
- **isOpen**: Boolean to control visibility
- **onClose**: Callback when modal closes
- **title** (optional): Modal header title
- **size** (optional): 'sm' | 'md' (default) | 'lg'
- **closeButton** (optional): Show close button (default: true)

### Features
- Click overlay to close
- ESC key to close
- Body scroll lock
- Smooth animations

### Usage Examples

```tsx
// State management
const [isOpen, setIsOpen] = useState(false);

// Modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Create New Campaign"
  size="md"
>
  <div className="space-y-4">
    <Input label="Campaign Name" />
    <Input label="Budget" type="number" />
    <div className="flex gap-2 justify-end pt-4">
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary">
        Create Campaign
      </Button>
    </div>
  </div>
</Modal>

// Open button
<Button onClick={() => setIsOpen(true)}>
  New Campaign
</Button>
```

---

## 6. Table Component

Data table with sorting, selection, and hover effects.

### Features
- Sortable columns (click header)
- Checkbox row selection
- Hover effects
- Custom cell rendering
- Responsive scrolling

### Column Definition

```tsx
interface Column<T> {
  key: keyof T;          // Data key
  header: string;        // Column header text
  sortable?: boolean;    // Enable sorting
  render?: (value, row) => ReactNode; // Custom render
  className?: string;    // Custom styling
}
```

### Usage Examples

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

const columns = [
  {
    key: 'name' as const,
    header: 'Campaign Name',
    sortable: true,
  },
  {
    key: 'status' as const,
    header: 'Status',
    sortable: true,
    render: (status) => (
      <Badge status={status}>{status}</Badge>
    ),
  },
  {
    key: 'budget' as const,
    header: 'Budget',
    sortable: true,
    render: (value) => formatCurrency(value),
  },
  {
    key: 'roi' as const,
    header: 'ROI',
    render: (value) => `${value.toFixed(2)}x`,
  },
];

<Table
  columns={columns}
  data={campaigns}
  selectable={true}
  rowIdKey="id"
  onSelectionChange={setSelectedIds}
  onRowClick={(campaign) => router.push(`/campaigns/${campaign.id}`)}
/>
```

---

## 7. Loading Components

Multiple loading indicators and skeletons.

### LoadingSpinner

```tsx
// Small spinner
<LoadingSpinner size="sm" />

// Medium with text
<LoadingSpinner size="md" text="Loading campaigns..." />

// Large spinner
<LoadingSpinner size="lg" text="Fetching data..." />
```

### Skeleton

```tsx
// Single skeleton
<Skeleton height="h-4" width="w-full" />

// Multiple lines
<Skeleton count={3} height="h-4" />

// Circle (for avatars)
<Skeleton circle height="h-10" width="w-10" />
```

### SkeletonCard

```tsx
// Card skeleton with default 3 lines
<SkeletonCard />

// Custom number of lines
<SkeletonCard count={5} />
```

### PageLoader

```tsx
// Full page overlay
<PageLoader fullPage={true} text="Loading..." />

// Inline loader
<PageLoader fullPage={false} text="Processing..." />
```

---

## 8. Toggle Component

Switch component styled with brand green when active.

### Props
- **size** (optional): 'sm' | 'md' (default) | 'lg'
- **label** (optional): Toggle label
- **description** (optional): Helper text
- Standard HTML checkbox attributes

### Usage Examples

```tsx
const [isEnabled, setIsEnabled] = useState(false);

// Simple toggle
<Toggle
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
/>

// With label
<Toggle
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
  label="Enable Auto Optimization"
  description="Automatically adjust bids daily"
  size="md"
/>

// Large toggle
<Toggle
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
  label="Daily Reports"
  size="lg"
/>
```

---

## 9. Tabs Component

Tab navigation with active indicator.

### Props
- **tabs**: Array of Tab objects
- **defaultTab** (optional): Initial active tab ID
- **onChange** (optional): Callback when tab changes
- **size** (optional): 'sm' | 'md' (default) | 'lg'

### Tab Definition

```tsx
interface Tab {
  id: string;              // Unique identifier
  label: string;          // Display label
  icon?: ReactNode;       // Optional icon
  content: ReactNode;     // Tab content
  disabled?: boolean;     // Disable tab
}
```

### Usage Examples

```tsx
const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <DashboardIcon />,
    content: <OverviewPanel />,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <ChartIcon />,
    content: <AnalyticsPanel />,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    content: <SettingsPanel />,
  },
];

<Tabs
  tabs={tabs}
  defaultTab="overview"
  onChange={(tabId) => console.log('Changed to:', tabId)}
  size="md"
/>
```

---

## Theme Colors

### Brand Colors
- **Primary**: #00e6a0 (Teal/Green)
- **Dark BG**: #0a0c10 (Page background)
- **Card BG**: #13161b (Card background)
- **Border**: #1e2128 (Borders)

### Status Colors
- **Success/Active**: Green (#10b981)
- **Warning/Paused**: Yellow (#f59e0b)
- **Error/Failed**: Red (#ef4444)
- **Info/Pending**: Blue (#3b82f6)

---

## Best Practices

1. **Always use `cn()` for className merging** to properly handle Tailwind conflicts
2. **Use semantic HTML** for better accessibility
3. **Provide proper labels** for form inputs
4. **Handle loading states** in user-facing actions
5. **Use appropriate button variants** for action importance
6. **Validate form data** and show errors in inputs
7. **Test on different screen sizes** for responsiveness
8. **Use the dark theme colors** for consistency

---

## Accessibility

All components follow accessibility best practices:
- Semantic HTML elements
- ARIA labels where appropriate
- Keyboard navigation support
- Focus indicators
- Screen reader friendly
- Proper color contrast

---

## Component Files Location

```
/src/components/ui/
├── button.tsx          # Button component
├── card.tsx            # Card component
├── input.tsx           # Input, Select, TextArea
├── badge.tsx           # Status badge
├── modal.tsx           # Modal dialog
├── table.tsx           # Data table
├── loading.tsx         # Spinners & skeletons
├── toggle.tsx          # Toggle switch
├── tabs.tsx            # Tab navigation
└── index.ts            # Barrel export
```

All components export TypeScript types for full type safety.
