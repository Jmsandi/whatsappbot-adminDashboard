# WhatsApp-Themed Dark Mode Color System

This document defines the color system for the admin dashboard with a WhatsApp-inspired dark theme.

## Core Colors

### Background Colors
- **Background Primary**: `#0A0E27` - Main dark background
- **Background Secondary**: `#1A1F37` - Sidebar and secondary surfaces
- **Background Tertiary**: `#252B45` - Elevated cards and panels
- **Background Hover**: `#2D3451` - Hover states on dark surfaces

### WhatsApp Green (Primary)
- **Primary**: `#25D366` - Main WhatsApp green
- **Primary Hover**: `#20BD5A` - Hover state
- **Primary Light**: `#34E877` - Lighter accent
- **Primary Dark**: `#1DA851` - Darker shade

### Text Colors
- **Text Primary**: `#FFFFFF` - Main text on dark
- **Text Secondary**: `#A0A6B8` - Secondary text
- **Text Muted**: `#6B7280` - Muted/disabled text
- **Text Inverse**: `#0A0E27` - Text on light backgrounds

### Status Colors
- **Success**: `#25D366` - Active, success states
- **Warning**: `#F59E0B` - Warning, pending states
- **Error**: `#EF4444` - Error, destructive states
- **Info**: `#3B82F6` - Informational states

### Border Colors
- **Border**: `#2D3451` - Default borders
- **Border Light**: `#3D4461` - Lighter borders
- **Border Focus**: `#25D366` - Focus states

### Card Colors
- **Card Background**: `#FFFFFF` - Light card background
- **Card Border**: `#E5E7EB` - Card borders
- **Card Hover**: `#F9FAFB` - Card hover state

## Component-Specific Colors

### Sidebar
- **Background**: `#1A1F37`
- **Active Item**: `#25D366`
- **Hover Item**: `#252B45`
- **Text**: `#A0A6B8`
- **Active Text**: `#FFFFFF`

### Buttons
- **Primary BG**: `#25D366`
- **Primary Text**: `#FFFFFF`
- **Primary Hover**: `#20BD5A`
- **Secondary BG**: `#252B45`
- **Secondary Text**: `#FFFFFF`
- **Secondary Hover**: `#2D3451`

### Badges
- **Success BG**: `#25D366`
- **Success Text**: `#FFFFFF`
- **Warning BG**: `#F59E0B`
- **Warning Text**: `#FFFFFF`
- **Error BG**: `#EF4444`
- **Error Text**: `#FFFFFF`
- **Info BG**: `#3B82F6`
- **Info Text**: `#FFFFFF`

### Input Fields
- **Background**: `#FFFFFF`
- **Border**: `#E5E7EB`
- **Focus Border**: `#25D366`
- **Text**: `#0A0E27`
- **Placeholder**: `#9CA3AF`

## CSS Variables

```css
:root {
  /* Background */
  --bg-primary: #0A0E27;
  --bg-secondary: #1A1F37;
  --bg-tertiary: #252B45;
  --bg-hover: #2D3451;
  
  /* WhatsApp Green */
  --primary: #25D366;
  --primary-hover: #20BD5A;
  --primary-light: #34E877;
  --primary-dark: #1DA851;
  
  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #A0A6B8;
  --text-muted: #6B7280;
  --text-inverse: #0A0E27;
  
  /* Status */
  --success: #25D366;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
  
  /* Borders */
  --border: #2D3451;
  --border-light: #3D4461;
  --border-focus: #25D366;
  
  /* Cards */
  --card-bg: #FFFFFF;
  --card-border: #E5E7EB;
  --card-hover: #F9FAFB;
}
```

## Tailwind Configuration

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0E27',
          secondary: '#1A1F37',
          tertiary: '#252B45',
          hover: '#2D3451',
        },
        primary: {
          DEFAULT: '#25D366',
          hover: '#20BD5A',
          light: '#34E877',
          dark: '#1DA851',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A0A6B8',
          muted: '#6B7280',
          inverse: '#0A0E27',
        },
        success: '#25D366',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      }
    }
  }
}
```

## Usage Examples

### Dark Background Layout
```tsx
<div className="bg-[#0A0E27] min-h-screen text-white">
  <aside className="bg-[#1A1F37]">
    {/* Sidebar content */}
  </aside>
  <main>
    {/* Main content */}
  </main>
</div>
```

### WhatsApp Green Button
```tsx
<button className="bg-[#25D366] hover:bg-[#20BD5A] text-white px-4 py-2 rounded-lg">
  Add Admin
</button>
```

### Status Badge
```tsx
<span className="bg-[#25D366] text-white px-3 py-1 rounded-full text-sm">
  active
</span>
```

### Card on Dark Background
```tsx
<div className="bg-white border border-gray-200 rounded-lg p-6">
  {/* Card content */}
</div>
```
