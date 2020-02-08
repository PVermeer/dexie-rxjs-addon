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
