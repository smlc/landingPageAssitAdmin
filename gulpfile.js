// Get things set up
// -------------------------------------------------------------------
// Include Gulp
var gulp = require("gulp"),
    // HTML plugins
    fileinclude = require("gulp-file-include"),
    htmlmin = require("gulp-htmlmin"),
    // CSS plugins
    sass = require("gulp-sass"),
    combineMediaQueries = require("gulp-combine-mq"),
    autoprefixer = require("gulp-autoprefixer"),
    cssmin = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    globber = require("glob"),
    // JS plugins
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    // Image plugin
    imagemin = require("gulp-imagemin"),
    // General plugins
    gutil = require("gulp-util"),
    plumber = require("gulp-plumber"),
    size = require("gulp-size"),
    watch = require("gulp-watch"),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

// Tasks
// -------------------------------------------------------------------
// Start server
gulp.task("browser-sync", function() {
    browserSync({
        notify: true,
        server: {
            baseDir: "dist"
        }
    });
});

// Notify on error with a beep
var onError = function(error) {
    console.log(gutil.colors.red(error.message));
    // https://github.com/floatdrop/gulp-plumber/issues/17
    this.emit("end");
    gutil.beep();
};

// HTML task
gulp.task("html", function() {
    return (
        gulp
            .src("./src/html/*.html")
            // Prevent gulp.watch from crashing
            .pipe(plumber(onError))
            // Set up HTML templating
            .pipe(
                fileinclude({
                    prefix: "@@",
                    basepath: "src/html"
                })
            )
            // Clean up HTML a little
            .pipe(
                htmlmin({
                    removeCommentsFromCDATA: true,
                    removeRedundantAttributes: true,
                    removeEmptyAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    caseSensitive: true,
                    minifyCSS: true
                })
            )
            // Where to store the finalized HTML
            .pipe(gulp.dest("dist"))
    );
});

// CSS task
gulp.task("css", function(cb) {
    return (
        gulp
            .src("src/scss/main.scss")
            // Prevent gulp.watch from crashing
            .pipe(plumber(onError))
            // Compile Sass
            .pipe(sass({ style: "compressed", noCache: true }))
            // Combine media queries
            .pipe(combineMediaQueries())
            // parse CSS and add vendor-prefixed CSS properties
            .pipe(
                autoprefixer({
                    browsers: ["last 2 versions"]
                })
            )
            // Minify CSS
            .pipe(cssmin())
            // Rename the file
            .pipe(rename("production.css"))
            // Show sizes of minified CSS files
            .pipe(size({ showFiles: true }))
            // Where to store the finalized CSS
            .pipe(gulp.dest("dist/css"))
    );
    cb();
});

// JS task
gulp.task("js", function() {
    return (
        gulp
            .src("src/js/**/*")
            // Prevent gulp.watch from crashing
            .pipe(plumber(onError))
            // Concatenate all JS files into one
            .pipe(concat("production.js"))
            // Minify JS
            .pipe(uglify())
            // Where to store the finalized JS
            .pipe(gulp.dest("dist/js"))
    );
});

// Image task
gulp.task("images", function() {
    return (
        gulp
            .src("src/img/**/*.+(png|jpeg|jpg|gif|svg)")
            // Prevent gulp.watch from crashing
            .pipe(plumber(onError))
            // Minify the images
            .pipe(imagemin())
            // Where to store the finalized images
            .pipe(gulp.dest("dist/img"))
    );
});

// Use default task to launch BrowserSync and watch all files
gulp.task(
    "default",
    gulp.parallel("browser-sync", function() {
        // All browsers reload after tasks are complete
        // Watch HTML files
        gulp.watch(["./src/html/**/*.html"], gulp.series("html")).on(
            `change`,
            reload
        );

        // Watch Sass files
        watch("src/scss/**/*", gulp.series("css", reload)).on(`change`, reload);

        // Watch JS files
        watch("src/js/**/*", gulp.series("js", reload)).on(`change`, reload);

        // Watch image files
        watch(
            "src/img/**/*.+(png|jpeg|jpg|gif|svg)",
            gulp.series("images", reload)
        ).on(`change`, reload);
    })
);
