<!-- markdownlint-disable MD007 MD024 -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

## [1.0.2] — 2024–05–06

### Fixed

- Paths in the `webmanifest` are now generated correctly on Windows.

## [1.0.1] — 2024–05–06

### Fixed

- The `conjure favicons` command now works fine on Windows.
- The `webmanifest` is now generated with a final newline.

## [1.0.0] — 2024–04–19

### Changed

- Now the `conjure favicons` command does not generate the entire set of files for each SVG found, including those nested in subdirectories. Instead, this command only works with files in the specified directory and expects at least one of `touch.svg`, `32.svg` and `16.svg` (preferably only the first two, and the third only if there is such a version in the design). See [README.md](./README.md) for details on preparing and working with these files.
- Now the `-r` (`--removeOrigin`) option also applies to the `conjure favicons` command.

### Added

- Gereration of `Links.md` file with advice on the code of links for generated files, moving files, and fixing paths to files.

## [0.1.2] — 2024–04–17

### Fixed

- No longer requires `pnpm` for package users.

## [0.1.1] — 2024–04–10

### Fixed

- Paths to icons in the generated webmanifest.

## [0.1.0] — 2024–04–05

### Added

- Basic functionality.

[Unreleased]: https://github.com/firefoxic/conjure/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/firefoxic/conjure/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/firefoxic/conjure/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/firefoxic/conjure/compare/v0.1.2...v1.0.0
[0.1.2]: https://github.com/firefoxic/conjure/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/firefoxic/conjure/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/firefoxic/conjure/releases/tag/v0.1.0
