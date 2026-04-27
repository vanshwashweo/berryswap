# Design Specification: AuraSwap "Atmospheric Pulse" Theme

## Overview
This document outlines the architectural and design decisions for the "Atmospheric Pulse" theme overhaul of AuraSwap.

## Visual Identity
- **Background**: Absolute Black (`#000000`). No gradients or secondary background colors.
- **Aesthetic**: "Atmospheric Pulse" - characterized by high-depth transparency, subtle borders, and vibrant neon accents.

## Design Tokens

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--background-start-rgb` | `0, 0, 0` | Body Background |
| `--background-end-rgb` | `0, 0, 0` | Body Background |
| `--foreground-rgb` | `248, 250, 252` | Primary Text |
| `black-pure` | `#000000` | Absolute Black |
| `brand-slate` | `#020617` | Secondary Dark Backgrounds |

### Components
- **Glass Containers**: `bg-black/40` background with `backdrop-blur-2xl`.
- **Borders**: 1px `rgba(255, 255, 255, 0.1)` (white/10).
- **Accents**: Cyan/Indigo gradients maintained but with subtle `drop-shadow` on hover to create glow.

## Typography
- **Headings**: `text-slate-50` (near-white), `font-bold`.
- **Body**: `text-slate-400`.
- **Interaction**: Text brightness increases on hover/active states.

## Decision Log
- **Background**: Absolute Black chosen for maximum OLED-friendly contrast.
- **Glassmorphism**: Switched from white-glass to dark-glass to maintain premium depth without brightness.
- **Borders**: Neutral white-transparency borders chosen over colored borders to keep the "Stealth" look clean.
