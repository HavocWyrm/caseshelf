# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Wanted page to allow for quick view of desired items
- Cover art uploads for ItemCards
- Add a sorting settings page

### Changed 
- Filter bar now displays "No Franchises" as an option
- Filter bar now allows fitering by whether an item has a URL link or not
- Sorting options now available on item type pages

### Fixed
- Franchise dropdown behaviour now makes sense (only fires when editing and field is active, doesn't re-fire when completed)
- Create and Add Another button now clears the correct fields

## [0.2.1] - TBD

### Added
- Item detail page

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