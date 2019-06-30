// Pull plugins into variables
var gulp = require("gulp");
var gulpPug = require("gulp-pug");
var gulpCoffee = require("gulp-coffee");
var gutil = require("gulp-util");
var concat = require("gulp-concat");
var gulpBrowserify = require("gulp-browserify");
var gulpif = require("gulp-if");
var uglify = require("gulp-uglify");
var gulpImagemin = require("gulp-imagemin");
var imageminPngcrush = require("imagemin-pngcrush");
var gulpSass = require("gulp-sass");

var browserSync = require("browser-sync").create();

var gulpGHPages = require("gulp-gh-pages");

// ENVIRONMENT VARIABLES MANAGED IN DOTENV FILES
require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`
});

// SET ENVIRONMENT VARIABLES HERE
var env = process.env.NODE_ENV || "development";

if (env === "development") {
  outputDir = "builds/development/";
  sassStyle = "expanded";
  pugOptions = {
    // debug: true
    // compileDebug: true
    locals: {
      baseUrl: "/"
    }
  };
  coffeeOptions = {
    bare: true
    // inlineMap: true
  };
} else {
  outputDir = "./builds/production/";
  sassStyle = "compressed";
  pugOptions = {
    debug: false,
    compileDebug: false,
    locals: {
      baseUrl: `${process.env.BASE_URL}`
    }
  };
  coffeeOptions = {
    bare: true
    // inlineMap: false
  };
}

// Process PUG PAGES into HTML for DEVELOPMENT and PRODUCTION
var pagesSource = "src/pages/**/*.pug";

function compilePugPages() {
  return gulp
    .src(pagesSource)
    .pipe(gulpPug(pugOptions))
    .pipe(gulp.dest(outputDir));
}

// Process COFFEESCRIPT FILES into JAVASCRIPT files and place in the JAVASCRIPT folder.
// Use an array incase you need to pass in other paths in a defined order...
var coffeeSources = ["./src/coffee/**/*.coffee"];

function transpileCoffeeFiles() {
  return gulp
    .src(coffeeSources)
    .pipe(gulpCoffee(coffeeOptions).on("error", gutil.log))
    .pipe(gulp.dest("./src/javascript/"));
}

// Concatenate JAVSCRIPT LIBRARY files for DEVELOPMENT and PRODUCTION
// Control the order of processing by listing files in an array
var librarySources = [
  "node_modules/jquery/dist/jquery.min.js",
  "node_modules/popper.js/dist/umd/popper.min.js",
  "node_modules/bootstrap/dist/js/bootstrap.min.js"
  // "./src/javascript/rclick.js",
  // "./src/javascript/pixgrid.js",
];

function moveLibraryFiles() {
  return gulp.src(librarySources).pipe(gulp.dest(outputDir + "js"));
}

// Concatenate JAVASCRIPT files for DEVELOPMENT and PRODUCTION
// Control the order of processing by listing files in an array
var javascriptSources = ["./src/javascript/**/*.js"];

function concatenateJavascriptFiles() {
  return gulp
    .src(javascriptSources)
    .pipe(concat("main.js"))
    .pipe(
      gulpBrowserify({
        insertGlobals: true,
        debug: !env.production
      })
    )
    .pipe(gulpif(env === "production", uglify()))
    .pipe(gulp.dest(outputDir + "js"));
}

// Process IMAGE files
var imageSources = ["src/images/**/*.*"];

function processImageFiles() {
  return gulp
    .src(imageSources)
    .pipe(
      gulpif(
        env === "production",
        gulpImagemin({
          progressive: true,
          svgoPlugins: [{ removeViewBox: false }],
          use: [imageminPngcrush()]
        })
      )
    )
    .pipe(gulp.dest(outputDir + "images"));
}

var scssSources = [
  "src/scss/*.scss"
  // "node_modules/bootstrap/scss/bootstrap.scss"
];

// Compile SCSS files to css
function compileScssFiles() {
  return gulp
    .src(scssSources)
    .pipe(gulpSass())
    .pipe(gulp.dest(outputDir + "css"));
}
gulp.task("sass", function() {});

// #################################################################
// #################################################################

// Create server connections
// gulp.task("connectdev", function() {
//   connect.server({
//     root: "builds/development",
//     port: 8080,
//     livereload: true
//   });
// });
// gulp.task("connectstage", function() {
//   connect.server({
//     root: "builds/staging",
//     port: 8001
//   });
// });

// gulp.task("watchdev", function() {
//   gulp.watch(coffeeSource, ["coffee"]);
//   gulp.watch(jsSource, ["js"]);
//   gulp.watch("src/templates/**/*.jade", ["jadedev"]);
//   gulp.watch("src/sass/**/*.scss", ["compass"]);
//   gulp.watch("src/images/**/*.*", ["images"]);
// });

/**
 * Push build to gh-pages
 */
// gulp.task("deploy", function() {
//   return gulp.src("./builds/staging/**/*").pipe(deploy());
// });

// gulp.task("default", [
//   "connectdev",
//   "vendor",
//   "jadedev",
//   "coffee",
//   "js",
//   "compass",
//   "images",
//   "watchdev"
// ]);

// function build() {
//   gulp.series(compileSCSS, concatCSS, concatLibraries, imgmin, jadePages);
// }

function watch() {
  browserSync.init({
    watchEvents: ["change", "add", "unlink", "addDir", "unlinkDir"],
    server: {
      baseDir: outputDir
    },
    open: "external"
  });
  gulp.watch(librarySources, moveLibraryFiles);
  gulp.watch(coffeeSources, transpileCoffeeFiles);
  gulp.watch(javascriptSources, concatenateJavascriptFiles);
  gulp.watch(imageSources, processImageFiles);
  gulp.watch(scssSources, compileScssFiles);
  gulp.watch(pagesSource, compilePugPages);
  gulp.watch([outputDir + "**/*.*"]).on("change", browserSync.reload);
}

function deploy(cb) {
  gulp.src("./builds/development/**/*").pipe(gulpGHPages());
  cb();
}

var build = gulp.series(
  moveLibraryFiles,
  transpileCoffeeFiles,
  concatenateJavascriptFiles,
  compileScssFiles,
  processImageFiles,
  compilePugPages
);

// GULP CLEAN
// - delete the build folder

// GULP RESET
// - delete the node_modules folder

// GULP DEVELOP
// - run build tasks and serve

// GULP BUILD
// - run build tasks in production env

// GULP EXPORTS
// call from the command line using gulp

var develop = gulp.series(build, watch);

// gulp.task("default", gulp.series(build, watch));

gulp.task("default", develop);

exports.moveLibraryFiles = moveLibraryFiles;
exports.transpileCoffeeFiles = transpileCoffeeFiles;
exports.concatenateJavascriptFiles = concatenateJavascriptFiles;
exports.compileScssFiles = compileScssFiles;
exports.processImageFiles = processImageFiles;
exports.compilePugPages = compilePugPages;

exports.build = build;
exports.develop = develop;
exports.watch = watch;
exports.deploy = deploy;
