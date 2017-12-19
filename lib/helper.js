/*
 * grunt-makemin
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Silver Connection, contributors
 * Licensed under the MIT license.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
// Regexp
exports.matchBlockStart = /<!--\s*build:(\w+)(?:\(([^\)]+)\))?\s*([^\s]+)\s*-->/;
exports.matchBlockStop = /<!--\s*endbuild\s*-->/;
exports.matchAsset = /(href|src)=["']([^'"]+)["']/;
exports.matchMedia = /media=['"]([^'"]+)['"]/;
// Templates
exports.templateStyle = '<link rel="stylesheet" type="text/css" href="{0}">';
exports.templateScript = '<script src="{0}"></script>';
/**
 * Get path for a asset.
 * Absolute paths are resolved from cwd
 * Relative paths are resolved from cwd and the HTML file
 * @param {string} cwd - Root path
 * @param {string} html - Path to HTML file relative to root path
 * @param {string} include - Path to asset, used in HTML file
 * @param {string} assetRoot - Path to asset, used in HTML file
 */
function getPathFile(cwd, html, include, assetRoot = "") {
    if (isPathAbsolute(include)) {
        // Is absolute
        return path.join(cwd, assetRoot, include.substr(1));
    }
    else {
        // Is relative, now we need to get the base path of the html file
        const relative = path.dirname(html);
        return path.join(cwd, assetRoot, relative, include);
    }
}
exports.getPathFile = getPathFile;
/**
 * Get path for use inside HTML files
 * @param {string} html - Path to HTML file relative to root path
 * @param {string} bundle - Path to bundle
 */
function getPathAsset(html, bundle) {
    if (isPathAbsolute(bundle)) {
        return bundle;
    }
    else {
        const relative = path.dirname(html);
        return path.join("/", relative, bundle);
    }
}
exports.getPathAsset = getPathAsset;
/**
 * Check if path is absolute
 * @param {string} file - Path to check
 */
function isPathAbsolute(file) {
    if ((file[0] === "/" && file[1] != "/") || file[0] === "~") {
        // Is absulute
        return true;
    }
    else {
        // Is relative
        return false;
    }
}
exports.isPathAbsolute = isPathAbsolute;
/**
 * Group array by expression
 * @param {array} list - List of objects
 * @param {function} keyGetter - Key getter function
 */
function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        }
        else {
            collection.push(item);
        }
    });
    return map;
}
exports.groupBy = groupBy;
/**
 * Sort array alphabetically
 * @param {array} list - List of objects
 * @param {function} keyGetter - Key getter function
 */
function sortBy(list, keyGetter) {
    const result = JSON.parse(JSON.stringify(list));
    result.sort(function (a, b) {
        const keyA = keyGetter(a);
        const keyB = keyGetter(b);
        if (keyA < keyB)
            return -1;
        if (keyA > keyB)
            return 1;
        return 0;
    });
    return result;
}
exports.sortBy = sortBy;
/**
 * Hash a file and add a suffix to the file.
 * @param {string} file - path to file
 * @param {string} algorithm - Hash algorithm
 * @param {number} length - Suffix length
 * @param {function} process - Custom rename function: (file: string, suffix: string, ext: string) => string
 */
function revAsset(file, algorithm, length, process) {
    if (!fs.existsSync(file)) {
        return path.basename(file) + "-NOT-FOUND";
    }
    const hash = crypto.createHash(algorithm).update(fs.readFileSync(file)).digest("hex");
    const suffix = hash.slice(0, length);
    const ext = path.extname(file);
    let newName = path.basename(file);
    if (typeof process === "function") {
        newName = process(path.basename(file, ext), suffix, ext.slice(1));
    }
    else {
        newName = [path.basename(file, ext), suffix, ext.slice(1)].join(".");
    }
    return newName;
}
exports.revAsset = revAsset;
/**
 * Rename a file
 * @param {string} oldName - path to file
 * @param {string} newName - hash algorithm
 */
function renameFile(oldName, newName) {
    if (fs.existsSync(oldName)) {
        fs.rename(oldName, newName);
    }
}
exports.renameFile = renameFile;
/**
 * Check if asset is file
 * @param {string} name - path to file
 */
function assetCheck(name) {
    if (name.substring(0, 4) === "http"
        || name.substring(0, 2) === "//"
        || name.substring(0, 4) === "data"
        || name.indexOf("@") > -1) {
        return false;
    }
    return true;
}
exports.assetCheck = assetCheck;
//# sourceMappingURL=helper.js.map