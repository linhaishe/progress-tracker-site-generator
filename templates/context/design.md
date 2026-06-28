---
version: alpha
name: "Progress Tracker Dashboard Design Direction"
status: "Generic template"
---

# Design

## Overview

The generated progress tracker page should feel like a dense operational dashboard for developers and AI agents returning to a project. It should be fast to scan, careful around risk, and optimized for handoff clarity rather than presentation or marketing.

## Theme Tokens

### Colors

| Token | Value | Role |
| ----- | ----- | ---- |
| `background` | `#EEEFE9` | Warm page background |
| `surface` | `#FDFDF8` | Panels and controls |
| `muted-surface` | `#F4F4F0` | Metadata and evidence blocks |
| `text` | `#111827` | Primary headings |
| `body-text` | `#374151` | Body content |
| `muted-text` | `#65675E` | Captions and timestamps |
| `border` | `#D2D3CC` | Dividers and panel borders |
| `primary` | `#EB9D2A` | Orientation accent |
| `primary-shadow` | `#CD8407` | Optional accent depth |
| `danger` | `#F35454` | High-risk or blocked state |
| `warning` | `#F7A501` | Attention or stale state |
| `success` | `#36C46F` | Confirmed complete state |
| `info` | `#30ABC6` | Informational state |

### Typography

| Role | Font | Size | Weight | Line Height |
| ---- | ---- | ---- | ------ | ----------- |
| Page title | `Arial, Helvetica, sans-serif` | `24px` | `700` | `32px` |
| Section heading | `Arial, Helvetica, sans-serif` | `18px` to `21px` | `700` | `28px` to `30px` |
| Body | `Arial, Helvetica, sans-serif` | `14px` to `15px` | `400` | `22px` to `24px` |
| Label | `Arial, Helvetica, sans-serif` | `12px` to `14px` | `600` to `700` | `16px` to `20px` |
| Caption | `Arial, Helvetica, sans-serif` | `12px` | `500` | `16px` |

## Layout Rules

- Use a full-width app shell with a readable max width around `1760px`.
- Use 4px increments and an 8px rhythm for panels and controls.
- Use dense spacing: `12px` to `20px` gaps between related blocks.
- Prefer borders and surface changes over shadows.
- Use cards only for repeated information modules.
- Keep cards at `8px` radius or less.
- Desktop should use a primary cockpit column and a secondary right rail.
- Mobile should stack all regions without horizontal overflow.

## Component Rules

- The first screen should be the usable progress dashboard, not a landing page.
- The dashboard should prioritize current focus, next workflow, risks, blockers, and verification.
- Amber should orient the reader, not dominate the page.
- Warnings, blockers, and verification gaps should be visually serious and easy to find.
- Missing or empty tracker sections should appear as quiet notices rather than disappearing.
- Manual refresh controls should feel secondary to the dashboard content.
