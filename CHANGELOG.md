# Wardrobe Changelog

**Current**  
- [0.1.0](#0.1.0)
- [0.2.0](#0.2.0)
- [0.3.0](#0.3.0)
- [0.3.1](#0.3.1)
  
&nbsp;

<a id="0.1.0"></a>

## 2026-02-03, Version 0.1.0
**Welcome to the initial pre-release version of Wardrobe!**  
It includes all the fundamental features of Wardrobe:
- Create/Browse/Delete Clothes
  - with: Image, Title, Description, Labels
- Create/Browse/Delete Outfits
  - with: Clothes per Body Part, Title, Labels
  - a rotatable preview human is displayed on View/Edit page
  - auto-updating image collection of clothes displayed on Browse page
- Create/Browse/Delete/Reorder Labels & Categories
  - Special Categories:
    - Season: Date Range, Temperature Range (no further functionality yet)
    - Color: Color Picker (no further functionality yet)
    - Body Part: Head, Hands, Arms, Torso, Legs, Feet (used in outfit editor)
  - Docker Image ships with set of default labels & categories
- Search by text, sort by name/date or filter by a combination of labels
- Jobs
  - default database/storage cleanup job already registered
  - viewable on Settings page
- Light/Dark Mode
- Responsive UI: Desktop, Tablet & Mobile layouts
- Docs: Overview, Installation instructions, Getting started paragraph

The UI has been developed & tested in Firefox.  
Docker image, build upon node:lts-alpine: https://hub.docker.com/repository/docker/3urobeat/wardrobe

Commit: [02bb46b](https://github.com/wardrobe-hq/wardrobe/commit/02bb46b)

&nbsp;

<a id="0.2.0"></a>

## 2026-03-22, Version 0.2.0
**Additions:**
- Added centralized localStorage read/write helper
- Added a scaling slider to clothes & outfits view pages
- Added browser dark mode detection if user has no local UX settings preference set
- Added mobile support to threedModelViewer
- Added weather:
  - Added weather API interaction with openweathermap.org
  - Added weather display in global title bar
  - Added weather configuration to settings page
  - Added automatic geolocating based on IP, overridable with lat/lon
- Added settings database, corresponding API routes and fields on settings page
- Added color for disabled inputs
- Added units:
  - Added temperature unit setting
  - Added auto unit conversion framework for frontend based on user setting
- Added outfit recommendation popup based on season speciality labels (temperature & date range)
- Added settingsSaved event to settings page
- Added i18n language translation system [#1](https://github.com/wardrobe-hq/wardrobe/issues/1)
  - Added English language
  - Added German language
  - Added debug language (only visible in debug mode)
  - Added language selector to settings page
- Added text hover auto scroll for overflowing lang strings in navbar buttons
- Added DayMonthInput component for season speciality popup
- Added yearless date comparison framework for season speciality & outfit recommendation popups
- Added setting process name & terminal title on server startup with new "core" plugin
- Added global server storage handler which (for now) provides size functions
- Added server statistics and show them on settings page

&nbsp;

**Reworks:**
- Improved scaling of titleBarFull
- Reset search bar on page switch and only show it on supported pages
- Centralized unsaved changes on page switch handler
- Log messages will now use appropiate log levels
- Reworked styling of search & dark mode toggle button group
- Improved label season speciality popup styling
- Added top/bottom overflow handling to pickerDialog positioning
- Made sure unset season speciality values remain null
- Reworked data handling on all pages to fix discarding unsaved changes not resetting local state
- Adjusted logos
- Made sure UXSettings is fully populated in getUXSettings()
- Improved navbar styling to make it more language consistent
- Improved formatTimestamp() function

&nbsp;

**Fixes:**
- Fixed overflow & scroll in filter bar
- Fixed navbar having y transition
- Fixed useFetch already mounted warning on settings page save
- Fixed empty outfits showing ALL clothes in preview image
- Fixed navbar hamburger button not being pressable
- Fixed card overflow on settings page

&nbsp;

**Changes:**
- Picker dialog will now close on ESC keypress
- Updated dependencies
- Minor other changes

The GitHub repository has moved from [my personal account](https://github.com/3urobeat) to a [GitHub Org](https://github.com/wardrobe-hq)!

Commit: [3e22505](https://github.com/wardrobe-hq/wardrobe/commit/3e22505)

&nbsp;

<a id="0.3.0"></a>

## 2026-05-19, Version 0.3.0
**Additions:**
- Added no JS warning
- Added frontend image cache
- Added image lazy loading
- Added UpdateObserver and subscribe API route for sending push updates and registering at it as a client
  - Added storage, job and subscription event types
  - Added event handler functions for (re)emitting subscription events
  - Added reactive cache invalidating & (re)fetching on subscription event
  - Added option to disable server subscription system; updates on settings save event
  - Added green server subscription state indicator to logo in title bar
  - Added client uuid cookie generation on subscribe to avoid sending storage updates to triggering client
- Added a storage lock mechanism for DatabaseItems to detect cache desync
- Added DatabaseMetaItem inserted into every database to track creation and last used date & version
- Added database migration feature that runs on startup
  - Added migration job for server settings to add its new static ID property
- Added centralized frontend storage helper for interacting with server's clothes, outfits, labels, settings, ... storages
  - Added centralized ApiResponse type with construction function and adapted all API responses to use it
  - Added SSR friendly caching for all content fetched from server
- Added centralized API log message prefix constructor
- Added notification component with log levels, timeout and action & dismiss buttons
  - Added notification trigger on API save conflict
- Display platform information and available RAM to process in server information
- Remember selected item sort in UXSettings
- styling: Added button click color change to give visual feedback
- Added DatabaseItem base type and required all DB records to have ID and timestamp fields
- Added diffing support for sending storage updates
- Added custom error page with back/home buttons

&nbsp;

**Reworks:**
- Reworked grid card scaling
- Reworked popup close mechanism to use more robust onClickOutside() instead of an invisible full screen div
- Reworked geolocating to use browser native function
- Declared custom nuxt hooks
- Reworked labels page and its API routes to use diffing
- Reworked saving items when server subscription is disabled to work correctly
- Reworked database get functions to filter DatabaseMetaItem from result
- Reworked all API routes and their corresponding functions to use stricter typing

&nbsp;

**Fixes:**
- Fixed unresponsive weather popout when saving settings
- Fixed img scaling on clothing view page
- styling: Fixed offcenter select dropdown options by decluttering input CSS definitions
- Fixed tsc & eslint warnings
- styling: Fixed full title bar padding & blur
- Fixed label quick add having no translation
- Fixed outfit & clothing edit pages redirecting on save failure

&nbsp;

**Changes:**
- styling: Use Trash instead of X on labels page for consistent delete vs remove meaning
- styling: Make close button in PickerDialog absolute when search bar is hidden to avoid consuming space
- styling: Make sure picker dialog X is square
- styling: Only show license information in footer on hover
- refactor: Reduced TS model file splitting
- refactor: Moved labels & categories to centralized helper
- Disabled password managers for weather api key field
- Renamed removeLabel/Category functions to delete for consistency
- Various TS type improvements to improve code read- & maintainability
- Change ServerSettings DB record to use a static ID
- Updated dependencies
- Minor other changes

Commit: [af9b9ca](https://github.com/wardrobe-hq/wardrobe/commit/af9b9ca)

&nbsp;

<a id="0.3.1"></a>

## 2026-05-23, Version 0.3.1
**Additions:**
- Added ping api route
- Added a state implementation for the server
- Added a server middleware and loading splash screen to prevent API access when server is not ready yet
- Implemented logger abstraction and fixed debug logs showing in prod

&nbsp;

**Reworks:**
- refactor: Moved weather popout to seperated component
- Reworked the server's structure to have a main file, group storage handlers together and improve job architecture
- Migrated the project's directory structure to Nuxt 4

&nbsp;

**Fixes:**
- Fixed oversight in clothing & outfit patching on subscription event, leading to page not updating correctly or not at all

&nbsp;

**Changes:**
- Don't show debug notifications in prod mode
- Updated contributing guidelines and added pull request template
- Minor other changes

Commit: [](https://github.com/wardrobe-hq/wardrobe/commit/)

&nbsp;
