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

const tsProject = ts.createProject('tsconfig.json', {
  typescript: typescript
});

gulp.task('compile', ['clean-package'], () => {
  return gulp.src([
    "test/**/*.ts",
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


gulp.task('declarations', ['compile'], function() {
  dts.bundle({
    name: "ethpm",
    main: "dist/ethpm.d.ts",
    baseDir: "dist",
    out: "main.d.ts"
  });
});

gulp.task('clean-package', () => (
  vfs.src('dist/package.json', {
    resolveSymlinks: false,
    allowEmpty: true
  })
    .pipe(vinylPaths(del))
));


gulp.task('package', () => (
  vfs.src('package.json', { resolveSymlinks: false })
    .pipe(vfs.symlink('dist'))
));

gulp.task('build', ['declarations', 'package']);

gulp.task('watch', ['build'], () => {
  gulp.watch([
    'src/**/*.ts',
    'test/**/*.ts',
    'types/**/*.ts',
  ], ['build'])
});

gulp.task('default', ['build']);
