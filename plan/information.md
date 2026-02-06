🏗️ App Planning & Architecture (Planning Phase Only)
1️⃣ App Vision & Scope
Purpose

A personal iOS gym progress app built with React Native that:

Works fully offline

Is fast to use during workouts

Focuses on long-term progress visualization

Is expandable (AI, gamification, cloud later)

Non-Goals (for now)

Social features

Accounts / auth

Monetization

Android support

This keeps scope sane.

2️⃣ Feature Breakdown (High-Level)
📦 Core Feature Sections

You should create one planning file per section.

3️⃣ Workout Logging System
Responsibilities

Create workouts

Add exercises

Add sets (reps, weight)

Add optional notes (RPE, feeling)

Concepts

Workout = date + list of exercises

Exercise = name + sets

Set = reps + weight

UX Considerations

One-handed usage

Minimal taps

Defaults based on last workout

4️⃣ Progress Tracking & Analytics
Responsibilities

Track performance per exercise

Detect personal records (PRs)

Show trends over time

Metrics

Max weight

Total volume

Strength progression

Strength-to-bodyweight ratio (future)

Visualizations

Line graphs per exercise

Highlight PR points

Time ranges (week / month / all)

5️⃣ Workout History & Review
Responsibilities

View past workouts

Edit or delete workouts

Compare sessions

Views

Calendar view

Chronological list

Exercise-centric history

Future Extension

“What changed since last time?”

6️⃣ Data & Storage Architecture (Conceptual)
Storage Strategy

Offline-first

Local persistence only (initially)

Data Characteristics

Immutable workout records

Append-only mindset

Derived stats computed on read

Backup Strategy (Future)

iCloud / local export

JSON-based data model

7️⃣ App Architecture (React Native Level)
Architectural Pattern

Feature-based structure

Clear separation:

UI

Domain logic

Storage

Layers

UI Layer

Screens

Components

Domain Layer

Workout logic

PR detection

Data Layer

Storage adapters

Serialization

8️⃣ Navigation & App Flow
Main Tabs

Dashboard

New Workout

History

Stats

Typical Flow

Open app

Start workout

Log exercises

Finish workout

Review progress

Fast path > fancy transitions.

9️⃣ Non-Functional Requirements
Performance

Fast app startup

Smooth scrolling with large histories

Reliability

No data loss

Graceful recovery on crash

Usability

Gym lighting friendly (dark mode first)

Big touch targets