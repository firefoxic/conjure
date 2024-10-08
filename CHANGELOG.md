<!-- markdownlint-disable MD007 MD024 -->
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com), and this project adheres to [Semantic Versioning](https://semver.org).

## [Unreleased]

### Fixed

- The `images` command with the `-r` flag now removes the source file only if no errors occurred during its processing.
- Error messages for the `images` command are now more readable.
- The verbose and useless `images` command execution messages have been replaced by a compact and clear progressbar.
- Source file extensions can now be in uppercase.

## [2.1.0] — 2024–08–13

### Added

- The `--addMetaData` (`-m`) flag is now also available for the `icons` command. Enabling it will create an `index.css` file in the output directory, which contains registrations of custom properties with paths to icons.
- The `--originDensity` (`-d`) option now takes the value `0`. This works like the `1` value, but without adding the density suffix to the filename.

## [2.0.0] — 2024–06–13

### Changed

- The `favicons` command no longer depends on the following options:
	- `-i` — the path to the directory with the files to be processed is now specified with the `-p` option;
	- `-o` — new files are created in the same directory as the original files (i.e., the directory specified by the `-p` option);
	- `-r` — the original favicon files are now always deleted after processing is complete.
- The `favicons` command now places only the `favicon.ico`, `manifest.webmanifest`, and `Links.md` files in the specified directory, with all other files being placed in the `favicons` subdirectory. This eliminates the need to manually move the listed files up one level. You only need to extract the `link` tags code from the `Links.md` file into your HTML layout and then delete the `Links.md` file.

### Added

- New CLI option `-p` (`--publicDirectory`) for the favicons command, allowing you to specify a directory (`public` by default) with static assets where the source SVG files for generating favicons are expected.
- New CLI flag `-m` (`--addMetaData`), enabling which when processing raster images additionally generates metadata files in JSON and JS formats.

## [1.0.3] — 2024–05–24

### Fixed

- The path to `icon-180.png` (Apple touch icon) is now correctly generated in `Links.md`.

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

[Unreleased]: https://github.com/firefoxic/conjure/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/firefoxic/conjure/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/firefoxic/conjure/compare/v1.0.3...v2.0.0
[1.0.3]: https://github.com/firefoxic/conjure/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/firefoxic/conjure/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/firefoxic/conjure/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/firefoxic/conjure/compare/v0.1.2...v1.0.0
[0.1.2]: https://github.com/firefoxic/conjure/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/firefoxic/conjure/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/firefoxic/conjure/releases/tag/v0.1.0
