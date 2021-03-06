"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var minify = require("gulp-csso");
var jsMinify = require("gulp-uglify");
var pump = require("pump");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgsprite = require("svg-sprite-generator");
var sprite = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var server = require("browser-sync").create();
var run = require("run-sequence");
var del = require("del");

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe (minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("compress", function (cb) {
  pump([
        gulp.src("js/*.js"),
        jsMinify(),
        gulp.dest("build/js")
    ],
    cb
  );
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
  return gulp.src("img/icon-*.svg")
  .pipe(svgsprite())
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"));
});

gulp.task("sprite", function () {
  return gulp.src("img/icon-*.svg")
  .pipe(sprite())
  .pipe(gulp.dest("build/img"));
});

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/*.{png,jpg,svg}",
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
    "compress",
    "copy",
    "webp",
    "sprite",
    done
  );
});

gulp.task("html:copy", function() {
  return gulp.src("*.html")
  .pipe(gulp.dest("build"))
});

gulp.task("html:update", ["html:copy"], function(done) {
  server.reload();
  done();
});

gulp.task("serve", ["style"], function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html", ["html:update"]);
  gulp.watch("build/css/*.css").on("change", server.reload);
});
