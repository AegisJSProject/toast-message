<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.0.3] - 2026-05-13

### Changed
- `toast()` now async and uses `navigator.locks` to queue toasts
- Rename physical (left/right) property names with logical names
- `whenDisposed` now awaits a `toggle` event with a `newState === 'closed'`
- Misc logic updates

## [v1.0.2] - 2026-05-12

### Fixed
- Add content to container when appending frag

## [v1.0.1] - 2026-05-12

### Added
- Add support for `DocumentFragment` in `create()` & `toast()`

## [v1.0.0] - 2026-05-12

Initial Release
