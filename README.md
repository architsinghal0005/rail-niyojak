# Rail Niyojak

AI Railway Maintenance Control Tower

SIH Problem Statement: SIH26027

"Synthetic prototype data — not connected to live Indian Railways systems."

## Project Overview

Rail Niyojak is an AI-powered integrated railway maintenance and block planning system. It acts as a central control tower to synthesize asset health data, predict optimal maintenance windows, resolve inter-departmental conflicts, and proactively "harvest" related maintenance tasks to maximize the efficiency of track possession hours.

## Architecture

Built using modern web technologies tailored for static deployment:
- **Framework**: Next.js (App Router, Static Export compatible)
- **UI & Styling**: Tailwind CSS, Lucide React icons
- **State Management**: Centralized synthetic state with safe hydration
- **Language**: English and Hindi localization (Web Speech API optional)

## Major Features

- **Block Harvesting**: Automatically identifies and groups overlapping or compatible maintenance tasks within the same corridor to maximize block utilization.
- **Block Planner**: A comprehensive interface to schedule tasks, resolve train movement conflicts, and generate optimal block window plans.
- **Maintenance Intelligence**: Calculates dynamic risk scores, priority scores, and urgency tiers based on synthetic telemetry.
- **Safety/Validation**: Integrated conflict detection prevents assigning conflicting resources, crews, or equipment.
- **Dynamic Replanning**: Supports emergency simulations and "What-If" scenarios to calculate the impact of deferring critical tasks.
- **Reports & Audit**: Generates detailed, exportable audit trails and performance metrics (e.g., Future Possession Hours Avoided).
- **Hindi/English**: Bilingual interface powered by an extensible translation dictionary.
- **Field Mode**: Lightweight PWA design for local caching and offline status queueing, geared towards field staff in low-connectivity areas.

## Deployment

This repository is configured to deploy directly to GitHub Pages via GitHub Actions as a statically exported Next.js application.
