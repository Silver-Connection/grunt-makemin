import * as path from "path";
import * as fs from "fs";
import * as grunt from "grunt";
import { } from "jest";
// import * as configer from "../src/configer";

// Actually load this plugin"s task(s).
grunt.loadTasks("tasks");

// These plugins provide necessary tasks.
grunt.loadNpmTasks("grunt-contrib-copy");
grunt.loadNpmTasks("grunt-contrib-clean");
grunt.loadNpmTasks("grunt-contrib-concat");
grunt.loadNpmTasks("grunt-mkdir");
grunt.config.init({
    // Clean
    clean: {
        flat: ["tmp/flat-result"],
        sub: ["tmp/sub-result"],
        complete: ["tmp/complete-result"],
    },

    // Configuration to be run (and then tested).
    makemin: {
        flat: {
            cwd: "tmp/flat",
            src: "*.html",
            dest: "tmp/flat-result",
            options: {
                writeLog: false,
            }
        },
        sub: {
            cwd: "tmp/sub",
            src: "{,*/}*.html",
            dest: "tmp/sub-result",
            options: {
                writeLog: false,
            }
        },
        complete: {
            cwd: "tmp/complete",
            src: "{,*/}*.html",
            dest: "tmp/complete-result",
            options: {
                writeLog: true,
            }
        },
    },
});

const opts = grunt.cli.options;
opts.redirect = !opts.silent;

describe("task: makemin", () => {
    describe("HTML:", () => {
        it("HTML: flat directory copy and replace", () => {
            // Create workspace
            // grunt.log.muted = false;
            // grunt.task.run(["clean:flat", "makemin:flat"]);
            // grunt.task.start();

            // Html
            expect(grunt.file.exists("tmp/flat-result/index.html")).toEqual(true);
            expect(grunt.file.exists("tmp/flat-result/empty.html")).toEqual(true);

            let correct = grunt.file.read("test/expected/flat/index.html").toString();
            let content = grunt.file.read("tmp/flat-result/index.html").toString();
            expect(content).toBe(correct);

            correct = grunt.file.read("test/expected/flat/empty.html").toString();
            content = grunt.file.read("tmp/flat-result/empty.html").toString();
            expect(content).toBe(correct);
        });

        it("HTML: sub-directories copy and replace", () => {
            // Create workspace
            // grunt.log.muted = true;
            // grunt.task.run(["clean:sub", "makemin:sub"]);
            // grunt.task.start();

            // Html
            expect(grunt.file.exists("tmp/sub-result/index.html")).toEqual(true);
            expect(grunt.file.exists("tmp/sub-result/empty.html")).toEqual(true);
            expect(grunt.file.exists("tmp/sub-result/sub/page-1.html")).toEqual(true);

            let correct = grunt.file.read("test/expected/sub/index.html").toString();
            let content = grunt.file.read("tmp/sub-result/index.html").toString();
            expect(content).toBe(correct);

            correct = grunt.file.read("test/expected/sub/empty.html").toString();
            content = grunt.file.read("tmp/sub-result/empty.html").toString();
            expect(content).toBe(correct);

            correct = grunt.file.read("test/expected/sub/sub/page-1.html").toString();
            content = grunt.file.read("tmp/sub-result/sub/page-1.html").toString();
            expect(content).toBe(correct);
        });
    });

    describe("Concat:", () => {
        it("Concat: flat directory, check file and content", () => {
            // Create workspace
            // grunt.log.muted = true;
            // grunt.task.run(["clean:flat", "makemin:flat", "concat:generated"]);
            // grunt.task.start();

            // Styles
            expect(grunt.file.exists("tmp/flat-result/styles/c.css")).toEqual(true);
            let correct = grunt.file.read("test/expected/flat/styles/c.css").toString();
            let content = grunt.file.read("tmp/flat-result/styles/c.css").toString();
            expect(content).toBe(correct);

            // Scripts
            expect(grunt.file.exists("tmp/flat-result/scripts/a.js")).toEqual(true);
            correct = grunt.file.read("test/expected/flat/scripts/a.js").toString();
            content = grunt.file.read("tmp/flat-result/scripts/a.js").toString();
            expect(content).toBe(correct);
        });

        it("Concat: sub-directories, check file and content", () => {
            // Create workspace
            // grunt.log.muted = true;
            // grunt.task.run(["clean:sub", "makemin:sub", "concat:generated"]);
            // grunt.task.start();

            // Styles
            expect(grunt.file.exists("tmp/sub-result/styles/c.css")).toEqual(true);
            let correct = grunt.file.read("test/expected/sub/styles/c.css").toString();
            let content = grunt.file.read("tmp/sub-result/styles/c.css").toString();
            expect(content).toBe(correct);

            expect(grunt.file.exists("tmp/sub-result/styles/d.css")).toEqual(true);
            correct = grunt.file.read("test/expected/sub/styles/d.css").toString();
            content = grunt.file.read("tmp/sub-result/styles/d.css").toString();
            expect(content).toBe(correct);

            // Scripts
            expect(grunt.file.exists("tmp/sub-result/scripts/a.js")).toEqual(true);
            correct = grunt.file.read("test/expected/sub/scripts/a.js").toString();
            content = grunt.file.read("tmp/sub-result/scripts/a.js").toString();
            expect(content).toBe(correct);

            expect(grunt.file.exists("tmp/sub-result/sub/b.js")).toEqual(true);
            correct = grunt.file.read("test/expected/sub/sub/b.js").toString();
            content = grunt.file.read("tmp/sub-result/sub/b.js").toString();
            expect(content).toBe(correct);
        });
    });
});