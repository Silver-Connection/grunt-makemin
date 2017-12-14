/*
 * grunt-makemin
 * https://github.com/vincent314/grunt-makemin
 *
 * Copyright (c) 2014 vincent314
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        // Before generating any new files, remove any previously-created files.
        "clean": {
            flat: ["tmp/flat", "tmp/flat-result"],
            sub: ["tmp/sub", "tmp/sub-result"],
            complete: ["tmp/complete", "tmp/complete-result"],
            full: ["tmp/flat", "tmp/full"],
            logs: ["make-bundle-*.json", "tmp"],
        },

        "mkdir": {
            flat: {
                options: {
                    create: ["tmp/flat", "tmp/flat/styles", "tmp/flat/scripts"]
                }
            },

            sub: {
                options: {
                    create: ["tmp/sub", "tmp/sub/styles", "tmp/sub/scripts", "tmp/sub/sub"]
                }
            },

            complete: {
                options: {
                    create: ["tmp/complete"]
                }
            },
        },

        "copy": {
            flat: {
                files: [{
                    src: "test/fixtures/index.html",
                    dest: "tmp/flat/index.html"
                },
                {
                    src: "test/fixtures/empty.html",
                    dest: "tmp/flat/empty.html"
                },
                {
                    expand: true,
                    flatten: true,
                    src: "test/fixtures/scripts/a*.js",
                    dest: "tmp/flat/scripts/"
                },
                {
                    expand: true,
                    flatten: true,
                    src: "test/fixtures/styles/c*.css",
                    dest: "tmp/flat/styles/"
                }]
            },
            sub: {
                files: [{
                    src: "test/fixtures/index.html",
                    dest: "tmp/sub/index.html"
                },
                {
                    src: "test/fixtures/empty.html",
                    dest: "tmp/sub/empty.html"
                },
                {
                    src: "test/fixtures/sub/page-1.html",
                    dest: "tmp/sub/sub/page-1.html"
                },
                {
                    expand: true,
                    flatten: true,
                    src: "test/fixtures/styles/c*.css",
                    dest: "tmp/sub/styles/"
                },
                {
                    expand: true,
                    flatten: true,
                    src: "test/fixtures/scripts/a*.js",
                    dest: "tmp/sub/scripts/"
                },
                {
                    expand: true,
                    flatten: true,
                    src: "test/fixtures/sub/b*.js",
                    dest: "tmp/sub/sub/"
                },
                {
                    expand: true,
                    flatten: true,
                    src: "test/fixtures/sub/d*.css",
                    dest: "tmp/sub/sub/"
                }]
            },
            complete: {
                files: [{
                    expand: true,
                    flatten: false,
                    cwd: "test/fixtures/template",
                    src: "**/*",
                    dest: "tmp/complete/"
                }]
            }
        },

        // Configuration to be run (and then tested).
        "make-bundle": {
            flat: {
                cwd: "tmp/flat",
                src: "*.html",
                dest: "tmp/flat-result",
                options: {
                    logWrite: true,
                }
            },
            sub: {
                cwd: "tmp/sub",
                src: "{,*/}*.html",
                dest: "tmp/sub-result",
                options: {
                    logWrite: true,
                }
            },
            complete: {
                cwd: "tmp/complete",
                src: "{,*/}*.html",
                dest: "tmp/complete-result",
                options: {
                    logWrite: true,
                }
            },
            full: {
                cwd: "tmp/complete",
                src: "{,*/}*.html",
                dest: "tmp/full",
                options: {
                    logWrite: true,
                    minCss: true,
                    minJs: true,
                    minHtml: true,
                    minHtmlOptions: {
                        removeComments: true,
                        collapseWhitespace: true
                    },
                    revAssets: true,
                    revAlgorithm: 'md5',
                    revLength: 8
                }
            },
        },

        // Build-in server
        "browserSync": {
            bsFiles: {
                src: [
                    "tmp/full/{,*/}*.html",
                    "tmp/full/styles/*.css",
                    "tmp/full/{,*/}*.js",
                    // "<%= config.stage.images %>/**/*",
                ]
            },
            options: {
                server: {
                    baseDir: "tmp/full"
                }
            }
        },
    });

    // Actually load this plugin"s task(s).
    grunt.loadTasks("tasks");

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-rename");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-htmlmin");
    grunt.loadNpmTasks("grunt-mkdir");
    grunt.loadNpmTasks("grunt-browser-sync");

    // Whenever the "test" task is run, first clean the "tmp" dir, then run this
    // plugin"s task(s), then test the result.
    grunt.registerTask("test-flat", [
        "clean:flat",
        "mkdir:flat",
        "copy:flat",
        "make-bundle:flat",
        "concat:generated"]);

    grunt.registerTask("test-sub", [
        "clean:sub",
        "mkdir:sub",
        "copy:sub",
        "make-bundle:sub",
        "concat:generated"]);

    grunt.registerTask("test-complete", [
        "clean:complete",
        "mkdir:complete",
        "copy:complete",
        "make-bundle:complete",
        "concat:generated",
        "copy:generated"
    ]);

    grunt.registerTask("tests", [
        "clean",
        "mkdir",
        "copy",
        "make-bundle:flat",
        "concat:generated",
        "make-bundle:sub",
        "concat:generated",
        "make-bundle:complete",
        "concat:generated",
        "copy:generated",
    ]);

    grunt.registerTask("default", [
        "clean:full",
        "mkdir:complete",
        "copy:complete",
        "make-bundle:full",
        "concat:generated",
        "copy:generated",
        "make-rev",
        "uglify:generated",
        "cssmin:generated",
        "htmlmin:generated",
        "rename:generated",
    ]);

    grunt.registerTask("server", [
        "browserSync"
    ]);
};