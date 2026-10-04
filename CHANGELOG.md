# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.3] - 2026-10-04

### Added
- Metadata lookup when adding items: TMDB for movies and shows, IGDB for games
- Refresh metadata and Re-match on item detail pages
- Fields edited by hand are locked against automatic refreshes
- Multiple genres per item, with one primary genre
- New metadata fields: synopsis, developer and publisher (games), runtime, director and certification (movies), total seasons, network and series status (shows)
- Settings: Providers tab for TMDB and IGDB API keys
- Settings: Jobs tab to match unlinked items, refresh stale metadata and clean up unused data

### Changed 
- Titles sort ignoring a leading "The", "A" or "An", with numbers in natural order
- Movies and shows are shelved by genre rather than format
- Movie and show genres are separate lists, each with its own sort order
- Platforms use IGDB's names, with a short name for compact views
- Item cards and Wanted rows are real links, so they can be opened in a new tab
- Items are edited on their detail page; the edit modal has been removed

### Security
- Updated Next.js to 16.3.8, clearing all known vulnerabilities reported by `npm audit`

## [0.2.2] - 2026-09-30

### Added
- Library sorting function
- Genres to collection items

### Changed
- Updated the settings page to allow custom sorting
- Swaped to dynamic routing system

## [0.2.1] - 2026-04-14

### Added
- Item detail page
- Wanted page to allow for quick view of desired items

### Changed
- Swapped sidebar to a new layout now there are more pages

### Fixed
- Franchise dropdown behaviour now makes sense (only fires when editing and field is active, doesn't re-fire when completed)

## [0.2.0] - 2026-04-10

### Added
- Filter bar on item pages
- Logos for all formats/platforms currently bundled
- Franchise and URL fields to the add/edit modal
    - Franchise to allow for items to be grouped
    - URL to allow wanted items to have links to stores

### Changed
- Replaced item card format/platform name with the bundled logos

## [0.1.2] - 2026-04-08

### Added
- "Create and Add Another" button on modal to allow for ease of adding multiple items in one session
- Settings page to allow users to indicate which platforms/formats they are interested in tracking

## [0.1.1] - 2026-04-06

### Added
- Individual sub pages for each item type
- Item cards for better display over simple rows

### Changed
- Tweaked UI to make more human readable
- Replaced table with dashboard view, with each type having it's own banner and add button
- Replaced form with a modal for adding/editing

### Removed

- Original display table on front page

## [0.1.0] - 2026-04-06

### Added

- Page for cataloguing collection items (games/movies/shows)
- Form for adding/editing items with
    - Title
    - Platform/format
    - Owned status 
- Initial collection of platforms and formats