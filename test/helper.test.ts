import * as path from "path";
import * as fs from "fs";
import { } from "jest";
import * as helper from "../src/helper";

describe("lib: helper", () => {
    describe("getPathFile()", () => {
        it("getPathFile(): Absolute paths", () => {
            expect(helper.getPathFile("tmp/flat", "index.html", "/scripts/a1.js"))
                .toBe("tmp/flat/scripts/a1.js");
        });

        it("getPathFile(): Absolute paths with tilde", () => {
            expect(helper.getPathFile("tmp/flat", "index.html", "~/scripts/a1.js"))
                .toBe("tmp/flat/scripts/a1.js");
            expect(helper.getPathFile("tmp/flat", "index.html", "~scripts/a1.js"))
                .toBe("tmp/flat/scripts/a1.js");
        });

        it("getPathFile(): Relative paths", () => {
            expect(helper.getPathFile("tmp/sub", "index.html", "scripts/a1.js"))
                .toBe("tmp/sub/scripts/a1.js");
            expect(helper.getPathFile("tmp/sub", "sub/page-1.html", "b1.js"))
                .toBe("tmp/sub/sub/b1.js");
        });
    });

    describe("getPathAsset()", () => {
        it("getPathAsset(): Absolute paths", () => {
            expect(helper.getPathAsset("index.html", "/scripts/a1.js"))
                .toBe("/scripts/a1.js");
        });

        it("getPathAsset(): Absolute paths with tilde", () => {
            expect(helper.getPathAsset("index.html", "~/scripts/a1.js"))
                .toBe("~/scripts/a1.js");
        });

        it("getPathAsset(): Relative paths", () => {
            expect(helper.getPathAsset("index.html", "scripts/a1.js"))
                .toBe("/scripts/a1.js");
            expect(helper.getPathAsset("sub/page-1.html", "b1.js"))
                .toBe("/sub/b1.js");
        });
    });

    describe("isPathAbsolute()", () => {
        it("isPathAbsolute(): Absolute paths", () => {
            expect(helper.isPathAbsolute("/scripts/a1.js"))
                .toBe(true);
        });

        it("getPathAsset(): Absolute paths with tilde", () => {
            expect(helper.isPathAbsolute("~/scripts/a1.js"))
                .toBe(true);
        });

        it("getPathAsset(): Relative paths", () => {
            expect(helper.isPathAbsolute("scripts/a1.js"))
                .toBe(false);
        });

        it("getPathAsset(): Remote path", () => {
            expect(helper.isPathAbsolute("//scripts/a1.js"))
                .toBe(false);
        });
    });
});