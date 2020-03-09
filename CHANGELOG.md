# [1.0.0-beta.6](https://github.com/PVermeer/dexie-rxjs-addon/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2020-03-09)


### Bug Fixes

* new fix for patching packages ([8b5fbd5](https://github.com/PVermeer/dexie-rxjs-addon/commit/8b5fbd5cd020e7a48fd0c12c4e6d4234da60dbd7))

# [1.0.0-beta.5](https://github.com/PVermeer/dexie-rxjs-addon/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2020-03-09)


### Bug Fixes

* **patches:** patches weren't deployed ([d1980d8](https://github.com/PVermeer/dexie-rxjs-addon/commit/d1980d87c4775fabe25433a842b76f1202b5f238))

# [1.0.0-beta.4](https://github.com/PVermeer/dexie-rxjs-addon/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2020-03-09)


### Bug Fixes

* patch declaration for dexie-observable ([7655c9c](https://github.com/PVermeer/dexie-rxjs-addon/commit/7655c9cc03bedbae53c0c82cf3ab7daa829afa90))

# [1.0.0-beta.3](https://github.com/PVermeer/dexie-rxjs-addon/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2020-03-09)


* refactor!: rxjs is now activated by using $ on a table ([0f7b571](https://github.com/PVermeer/dexie-rxjs-addon/commit/0f7b571a778c55ece4ef55b00164918ace28684b))
* refactor!: update to dexie 3 ([3cfba47](https://github.com/PVermeer/dexie-rxjs-addon/commit/3cfba472803e8c3a9ab0af110fdfdd5c8e852ac5))


### Bug Fixes

* **errors:** now catches schema error earlier ([e0988d3](https://github.com/PVermeer/dexie-rxjs-addon/commit/e0988d3ec30d0dc60e607e55722cdd55317fe265))


### BREAKING CHANGES

* Higher maintainability by providing custom classes after $.
* refactor to use methods not available in Dexie 2 and keep in line with other addons.

# [1.0.0-beta.2](https://github.com/PVermeer/dexie-rxjs-addon/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2020-02-09)


### Bug Fixes

* **typings:** typing now works ([f8f6253](https://github.com/PVermeer/dexie-rxjs-addon/commit/f8f625370096afb7e29cfacfb82809bbe852ff02))

# 1.0.0-beta.1 (2020-02-08)


### Bug Fixes

* observables now only emit when data is changed ([77acf46](https://github.com/PVermeer/dexie-rxjs-addon/commit/77acf46f315f29170140656091bc1ad902fc217d))
* **get$:** after changes now the correct record is emitted ([f886324](https://github.com/PVermeer/dexie-rxjs-addon/commit/f886324d06de22c9a821c1453b040f3c5fcf8180))
* **set-primary-key:** ++ as primKey now works ([78bf80b](https://github.com/PVermeer/dexie-rxjs-addon/commit/78bf80b18940a293afa635c37e51b494f3c1aa37))


### Features

* table now has .$ observable ([2c50b6f](https://github.com/PVermeer/dexie-rxjs-addon/commit/2c50b6f58140a3da980f56aa3c9c354514935ea8))
* **methods:** collection from where calls now have $ getter ([403f19f](https://github.com/PVermeer/dexie-rxjs-addon/commit/403f19f7fa2e7df4aea30f30b4e947297fc1e754))
* added get$() method ([d6171b3](https://github.com/PVermeer/dexie-rxjs-addon/commit/d6171b381fa681ea239dcbff385ee5ef206519cc))


### Performance Improvements

* **table$:** the table observable should now be more efficient ([26d1059](https://github.com/PVermeer/dexie-rxjs-addon/commit/26d1059c078a141742a47959c0e29f29d80d2de6))
