// gulpfile.js
const path = require('path');
const gulp = require('gulp');
const del = require('del');
const vfs = require("vinyl-fs");
const vinylPaths = require("vinyl-paths");
const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const typescript = require('typescript');
const dts = require('dts-bundle');
const typedoc = require('gulp-typedoc');

const tsProject = ts.createProject('tsconfig.json', {
  typescript: typescript
});

gulp.task('compile-source', ['clean-symlinks'], () => {
  return gulp.src([
    "src/**/*.ts",
    "!**/test/*.ts"
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(babel({
      ignore: ["**/*.d.ts"]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
});

gulp.task('compile-test', ['compile-source'], () => {
  return gulp.src([
    "test/**/*.ts",
    "!**/test/*.ts"
  ])
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(babel({
      ignore: ["**/*.d.ts"]
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/test'))
});

gulp.task('compile', ['compile-test']);

gulp.task('declarations', ['compile'], function() {
  dts.bundle({
    name: "ethpm",
    main: "dist/ethpm.d.ts",
    baseDir: "dist",
    out: "main.d.ts"
  });
});

gulp.task('clean-symlinks', () => (
  vfs.src([
    'dist/package.json',
    'dist/README.md',
  ], {
    resolveSymlinks: false,
    allowEmpty: true
  })
    .pipe(vinylPaths(del))
));


gulp.task('copy-symlinks', () => (
  vfs.src([
    'package.json',
    'README.md'
  ], { resolveSymlinks: false })
    .pipe(vfs.symlink('dist'))
));

gulp.task('docs', ['declarations'], () => {
  return gulp.src([
    "src/**/*.ts",
    "!src/index.ts",
    "!**/test/*.ts",
    "test/**/*.ts"
  ])
    .pipe(typedoc({
      ...require("./typedoc.json"),
      logger: 'none'
    }));
});

gulp.task('build', ['docs', 'copy-symlinks']);

gulp.task('watch', ['build'], () => {
  return gulp.watch([
    'src/**/*.ts',
    'test/**/*.ts',
    'types/**/*.ts',
  ], ['build'])
});

gulp.task('default', ['build']);
