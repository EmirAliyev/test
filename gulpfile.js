const { src, dest, series, watch, parallel } = require("gulp");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");
const deploy = require("gulp-gh-pages");
const sass = require("gulp-sass")(require("sass"));
const csso = require("gulp-csso");
const ttf2woff2 = require("gulp-ttf2woff2");
const include = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const del = require("del");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const autoprefixer = require("gulp-autoprefixer");
const changed = require("gulp-changed");
const imagemin = require("gulp-imagemin");
const sync = require("browser-sync").create();
const gulp = require("gulp");

const DEST_FOLDER = "dist";
const JAVASCRIPT_SOURCE = "src/js/**/*.js";
const JAVASCRIPT_FOLDER = "dist/js";
const HTML_SOURCE = "src/*.html";
const SCSS_SOURCE = "src/scss/**/*.scss";
const SCSS_CONCAT_FILENAME = "main.min.css";
const SCSS_FOLDER = "dist/styles";
const FONTS_SOURCE = "src/fonts/**/*.ttf";
const FONTS_FOLDER = "dist/fonts";
const IMAGES_SOURCE = "src/images/**/*.+(png|jpg|jpeg|gif|svg|ico)";
const IMAGES_FOLDER = "dist/images";
const LIBS_SOURCE = "src/libs/**/*";
const LIBS_FOLDER = "dist/libs";

const renameJS = ({ dirname, basename, extname }) => ({
  dirname,
  basename: `${basename}.min`,
  extname,
});

gulp.task("deploy", function () {
  return gulp.src("./dist/**/*").pipe(
    deploy({
      remoteUrl: "https://github.com/EmirAliyev/retina_gsap.git",
      branch: "main",
    })
  );
});

const clear = () => del(DEST_FOLDER);

const devJS = () =>
  src(JAVASCRIPT_SOURCE).pipe(rename(renameJS)).pipe(dest(JAVASCRIPT_FOLDER));

const prodJS = () =>
  src(JAVASCRIPT_SOURCE)
    .pipe(babel())
    .pipe(uglify())
    .pipe(rename(renameJS))
    .pipe(dest(JAVASCRIPT_FOLDER));

const devScss = () =>
  src(SCSS_SOURCE)
    .pipe(sass().on("error", sass.logError))
    .pipe(concat(SCSS_CONCAT_FILENAME))
    .pipe(dest(SCSS_FOLDER));

const prodScss = () =>
  src(SCSS_SOURCE)
    .pipe(sass().on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(concat(SCSS_CONCAT_FILENAME))
    .pipe(dest(SCSS_FOLDER));

const devHtml = () =>
  src(HTML_SOURCE)
    .pipe(
      include({
        prefix: "@",
      })
    )
    .pipe(dest(DEST_FOLDER));

const prodHtml = () =>
  src(HTML_SOURCE)
    .pipe(
      include({
        prefix: "@",
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest(DEST_FOLDER));

const fonts = () =>
  src(FONTS_SOURCE).pipe(ttf2woff2()).pipe(dest(FONTS_FOLDER));

const devImages = () =>
  src(IMAGES_SOURCE).pipe(changed(DEST_FOLDER)).pipe(dest(IMAGES_FOLDER));

const prodImages = () =>
  src(IMAGES_SOURCE)
    .pipe(changed(DEST_FOLDER))
    .pipe(imagemin())
    .pipe(dest(IMAGES_FOLDER));

const libs = () =>
  src(LIBS_SOURCE).pipe(changed(DEST_FOLDER)).pipe(dest(LIBS_FOLDER));

const watches = () => {
  sync.init({
    server: DEST_FOLDER,
  });

  watch(["src/**/*.html", HTML_SOURCE], parallel(devHtml)).on(
    "change",
    sync.reload
  );
  watch(SCSS_SOURCE, parallel(devScss)).on("change", sync.reload);
  watch(FONTS_SOURCE, parallel(fonts)).on("change", sync.reload);
  watch(IMAGES_SOURCE, parallel(devImages)).on("change", sync.reload);
  watch(JAVASCRIPT_SOURCE, parallel(devJS)).on("change", sync.reload);
  watch(LIBS_SOURCE, parallel(libs)).on("change", sync.reload);
};

const start = () =>
  sync.init({
    server: DEST_FOLDER,
  });

exports.build = series(
  clear,
  parallel(prodScss, prodHtml, fonts, prodImages, prodJS, libs)
);
exports.start = start;
exports.serve = series(
  clear,
  parallel(devScss, devHtml, fonts, devImages, devJS, libs),
  watches
);
exports.clear = clear;
exports.devJS = devJS;
