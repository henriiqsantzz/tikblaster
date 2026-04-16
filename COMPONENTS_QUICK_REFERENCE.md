# TikBlaster UI Components - Quick Reference

## Import Statement

```tsx
import {
  Button, Card, Input, Select, TextArea, Badge, Modal,
  Table, LoadingSpinner, Skeleton, SkeletonCard, PageLoader,
  Toggle, Tabs
} from '@/components/ui';
```

## Component Examples

### Button
```tsx
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Learn More</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button loading>Processing...</Button>
```

### Card
```tsx
<Card>
  Simple card content
</Card>

<Card title="Campaigns" subtitle="Active campaigns" icon={<Icon />}>
  Card content with header
</Card>

<Card
  title="Analytics"
  actions={<Button size="sm">More</Button>}
>
  Card with actions
</Card>
```

### Input Components
```tsx
<Input type="text" placeholder="Name" />
<Input label="Email" type="email" error="Invalid email" />
<Input label="Budget" type="number" icon={<DollarIcon />} />

<Select
  label="Status"
  options={[
    { value: 'active', label: 'Active' },
    { value: 'paused', label: 'Paused' }
  ]}
/>

<TextArea label="Description" rows={4} />
```

### Badge
```tsx
<Badge status="ACTIVE">Active</Badge>
<Badge status="PAUSED">Paused</Badge>
<Badge status="ERROR">Error</Badge>
<Badge status="PENDING">Pending</Badge>
```

### Modal
```tsx
const [open, setOpen] = useState(false);

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Create Campaign"
  size="md"
>
  <div>Modal content</div>
</Modal>

<Button onClick={() => setOpen(true)}>Open Modal</Button>
```

### Table
```tsx
const columns = [
  { key: 'name', header: 'Name', sortable: true },
  {
    key: 'status',
    header: 'Status',
    render: (status) => <Badge status={status}>{status}</Badge>
  },
  { key: 'budget', header: 'Budget', sortable: true }
];

<Table
  columns={columns}
  data={campaigns}
  selectable
  rowIdKey="id"
  onSelectionChange={handleSelect}
  onRowClick={(row) => navigate(`/campaigns/${row.id}`)}
/>
```

### Loading Components
```tsx
<LoadingSpinner />
<LoadingSpinner size="lg" text="Loading..." />

<Skeleton count={3} />
<Skeleton circle height="h-10" width="w-10" />

<SkeletonCard count={5} />

<PageLoader fullPage={true} text="Loading..." />
```

### Toggle
```tsx
<Toggle
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>

<Toggle
  label="Enable Notifications"
  description="Get daily reports"
  size="md"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>
```

### Tabs
```tsx
const tabs = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <Icon />,
    content: <OverviewPanel />
  },
  {
    id: 'analytics',
    label: 'Analytics',
    content: <AnalyticsPanel />
  },
  {
    id: 'settings',
    label: 'Settings',
    disabled: false,
    content: <SettingsPanel />
  }
];

<Tabs
  tabs={tabs}
  defaultTab="overview"
  size="md"
  onChange={(tabId) => console.log(tabId)}
/>
```

## Theme Colors

### Primary Colors
| Name | Value | Usage |
|------|-------|-------|
| Brand | #00e6a0 | Buttons, active states, highlights |
| Dark BG | #0a0c10 | Page background |
| Dark Card | #13161b | Card background |
| Dark Border | #1e2128 | Borders, dividers |

### Status Colors
| Status | Color | Component |
|--------|-------|-----------|
| ACTIVE | Green | Badge, toggle active |
| PAUSED | Yellow | Badge |
| ERROR | Red | Badge, danger button |
| PENDING | Blue | Badge |

## Component Props Summary

### Button
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean

### Card
- `title`: string (optional)
- `subtitle`: string (optional)
- `icon`: ReactNode (optional)
- `actions`: ReactNode (optional)

### Input/Select/TextArea
- `label`: string (optional)
- `error`: string (optional)
- `placeholder`: string (optional)
- `disabled`: boolean (optional)

### Badge
- `status`: 'ACTIVE' | 'PAUSED' | 'ERROR' | 'PENDING'

### Modal
- `isOpen`: boolean (required)
- `onClose`: () => void (required)
- `title`: string (optional)
- `size`: 'sm' | 'md' | 'lg'
- `closeButton`: boolean (default: true)

### Table
- `columns`: Column<T>[] (required)
- `data`: T[] (required)
- `selectable`: boolean
- `rowIdKey`: keyof T
- `onSelectionChange`: (ids: string[]) => void
- `onRowClick`: (row: T) => void

### Toggle
- `size`: 'sm' | 'md' | 'lg'
- `label`: string (optional)
- `description`: string (optional)
- `checked`: boolean (optional)

### Tabs
- `tabs`: Tab[] (required)
- `defaultTab`: string (optional)
- `size`: 'sm' | 'md' | 'lg'
- `onChange`: (tabId: string) => void

## Common Patterns

### Form Submission
```tsx
const [formData, setFormData] = useState({ name: '', budget: 0 });
const [errors, setErrors] = useState({});

const handleSubmit = () => {
  // Validate and submit
};

<Card title="Create Campaign">
  <Input
    label="Campaign Name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    error={errors.name}
  />
  <Input
    label="Budget"
    type="number"
    value={formData.budget}
    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
    error={errors.budget}
  />
  <div className="flex gap-2 justify-end pt-4">
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary" onClick={handleSubmit}>Create</Button>
  </div>
</Card>
```

### Loading State
```tsx
const [loading, setLoading] = useState(false);

if (loading) {
  return <PageLoader text="Loading campaigns..." />;
}

return <div>{/* Content */}</div>;
```

### Selection with Actions
```tsx
const [selected, setSelected] = useState<string[]>([]);

<Card>
  {selected.length > 0 && (
    <div className="mb-4 flex gap-2">
      <Button variant="danger" size="sm">
        Delete ({selected.length})
      </Button>
      <Button variant="secondary" size="sm" onClick={() => setSelected([])}>
        Clear
      </Button>
    </div>
  )}
  <Table
    columns={columns}
    data={data}
    selectable
    onSelectionChange={setSelected}
  />
</Card>
```

## Best Practices

1. Always use `cn()` for className merging
2. Provide labels for all form inputs
3. Show error messages in validation
4. Use appropriate button variants for actions
5. Handle loading states with spinners
6. Keep modals focused on single tasks
7. Use tables for tabular data only
8. Provide default selected values for selects
9. Test on multiple screen sizes
10. Maintain dark theme consistency

## File Locations

```
src/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── badge.tsx
├── modal.tsx
├── table.tsx
├── loading.tsx
├── toggle.tsx
├── tabs.tsx
└── index.ts
```

## Full Documentation

See `COMPONENTS_GUIDE.md` for comprehensive documentation with code examples.
