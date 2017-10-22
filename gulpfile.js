"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgsprite = require("svg-sprite-generator");
var sprite = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var server = require("browser-sync").create();
var run = require("run-sequence");
var del = require("del");
var variables = require("gulp-vars");

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(variables())
    .pipe(gulp.dest("build/css"))
    .pipe (minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("images", function () {
  return gulp.src("img/**/*.{png,jpg,svg}")
  .pipe(imagemin([
    imagemin.optipng({optimizationLevel: 3}),
    imagemin.jpegtran({progressive: true}),
    imagemin.svgo()
  ]))
});

gulp.task("webp", function () {
  return gulp.src("img/*.{png,jpg}")
  .pipe(webp({quality: 90}))
  .pipe(gulp.dest("build/img"));
});

gulp.task("svgsprite", function () {
  // return del("build/img/sprite.svg")
  return gulp.src("img/icon-*.svg")
  .pipe(svgsprite())
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp.src("img/icon-*.svg")
  // .pipe(svgmin(function (file) {
  //   var prefix = path.basename(file.relative, path.extname(file.relative));
  //   return {
  //     plugins: [{
  //       cleanupIDs: {
  //         prefix: prefix + '-',
  //         minify: true;
  //       }
  //     }]
  //   }
  // }))
  .pipe(sprite())
  .pipe(gulp.dest("build/img"));
});

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/*.{png,jpg,svg}",
    "js/**",
    "*.html"
    ], {
      base: "."
    })
  .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", function (done) {
  run(
    "clean",
    "style",
    "copy",
    "webp",
    "sprite",
    done
  );
});

var defaultTask = ["build"];

// gulp.task("default", defaultTask);

gulp.task("serve", ["style"], function() {
  server.init({
    server: ".",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html").on("change", server.reload);
});
