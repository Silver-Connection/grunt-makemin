/*
 * grunt-makemin
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Silver Connection, contributors
 * Licensed under the MIT license.
 */

"use strict";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";

// Regexp
export const matchBlockStart = /<!--\s*build:(\w+)(?:\(([^\)]+)\))?\s*([^\s]+)\s*-->/;
export const matchBlockStop = /<!--\s*endbuild\s*-->/;
export const matchAsset = /(href|src)=["']([^'"]+)["']/;
export const matchMedia = /media=['"]([^'"]+)['"]/;

// Templates
export const templateStyle = '<link rel="stylesheet" type="text/css" href="{0}">';
export const templateScript = '<script src="{0}"></script>';

/**
 * Get path for a asset.
 * Absolute paths are resolved from cwd
 * Relative paths are resolved from cwd and the HTML file
 * @param {cwd} string - Root path
 * @param {html} string - Path to HTML file relative to root path
 * @param {include} string - Path to asset, used in HTML file
 * @param {assetRoot} string - Path to asset, used in HTML file
 */
export function getPathFile(cwd: string, html: string, include: string, assetRoot: string = ""): string {
    if (isPathAbsolute(include)) {
        // Is absolute
        return path.join(cwd, assetRoot, include.substr(1));
    } else {
        // Is relative, now we need to get the base path of the html file
        const relative = path.dirname(html);
        return path.join(cwd, assetRoot, relative, include);
    }
}

/**
 * Get path for use inside HTML files
 * @param {html} string - Path to HTML file relative to root path
 * @param {bundle} string - Path to bundle
 */
export function getPathAsset(html: string, bundle: string): string {
    if (isPathAbsolute(bundle)) {
        return bundle;
    } else {
        const relative = path.dirname(html);
        return path.join("/", relative, bundle);
    }
}

/**
 * Check if path is absolute
 * @param {file} string - Path to check
 */
export function isPathAbsolute(file: string): boolean {
    if ((file[0] === "/" && file[1] != "/") || file[0] === "~") {
        // Is absulute
        return true;
    } else {
        // Is relative
        return false;
    }
}

/**
 * Group array by expression
 * @param {list} list
 * @param {keyGetter} keyGetter
 */
export function groupBy<T>(list: Array<T>, keyGetter: (item: T) => any): Map<string, Array<T>> {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}

/**
 * Sort array alphabetically
 * @param {list} list
 * @param {keyGetter} keyGetter
 */
export function sortBy<T>(list: Array<T>, keyGetter: (item: T) => string | number): Array<T> {
    const result = JSON.parse(JSON.stringify(list));
    result.sort(function (a: T, b: T) {
        const keyA = keyGetter(a);
        const keyB = keyGetter(b);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
    });

    return result;
}

/**
 * Hash a file and add a suffix to the file.
 * @param {file} path to file
 * @param {algorithm} hash algorithm
 * @param {length} suffix length
 * @param {process} custom function for renaming
 */
export function revAsset(file: string, algorithm: string, length: number, process?: (file: string, suffix: string, ext: string) => string): string {
    const hash = crypto.createHash(algorithm).update(fs.readFileSync(file)).digest("hex");
    const suffix = hash.slice(0, length);
    const ext = path.extname(file);
    let newName = path.basename(file);

    if (typeof process === "function") {
        newName = process(path.basename(file, ext), suffix, ext.slice(1));
    } else {
        newName = [path.basename(file, ext), suffix, ext.slice(1)].join(".");
    }

    return newName;
}

export function renameFile(oldName: string, newName: string): void {
    if (fs.existsSync(oldName)) {
        fs.rename(oldName, newName);
    }
}