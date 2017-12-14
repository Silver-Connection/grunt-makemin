/*
 * grunt-makemin
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Silver Connection, contributors
 * Licensed under the MIT license.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const cheerio = require("cheerio");
const URLRewriter = require("cssurl").URLRewriter;
const helper = require("./helper");
class Project {
    constructor() {
        this.src = "";
        this.dest = "";
        this.html = [];
        this.css = [];
        this.bundles = [];
        this.images = [];
        this.scripts = [];
        this.styles = [];
    }
    jsonWrite() {
        return JSON.stringify(this, undefined, 2);
    }
    jsonLoad(data) {
        Object.assign(this, data);
        return this;
    }
    //#region Distinct
    /**
     * Distinct all bundles and check for invalid duplicates
     */
    distinctBundles() {
        let bundles = [];
        this.html.forEach((file, index, arr) => {
            bundles = bundles.concat(file.bundles);
        });
        const clean = [];
        const group = helper.groupBy(bundles, b => b.dest);
        const keys = group.keys();
        for (let i = 0; i < group.size; i++) {
            const dest = keys.next().value;
            const matches = group.get(dest);
            // Check bundles
            if (matches.length > 1) {
                // const includes = helper.sortBy(matches[0].files, f => f);
                const includes = matches[0].files;
                matches.forEach((bundle, index, arry) => {
                    // console.log("First: " + includes.length + " Found: " + bundle.files.length + " IN: " + bundle.html + " : " + bundle.name );
                    if (includes.length === bundle.files.length) {
                        // const list = helper.sortBy(bundle.files, f => f);
                        for (let i = 0; i < includes.length; i++) {
                            if (includes[i] !== bundle.files[i]) {
                                throw "Bundle: " + bundle.name + " in file: " + bundle.html + ", does not match.\n"
                                    + "Asset file should be: " + includes[i] + ", but it is: " + bundle.files[i] + "\n"
                                    + "The included files are not identical with the other bundles, with the same destination.";
                            }
                        }
                    }
                    else {
                        throw "Bundle: " + bundle.name + " in file: " + bundle.html + ", does not match.\n"
                            + "Bundle should have: " + includes.length + ", but it has: " + bundle.files.length + " assets.\n"
                            + "The included files are not identical with the other bundles, with the same destination.";
                    }
                });
            }
            clean.push(matches[0]);
        }
        this.bundles = clean;
        return this;
    }
    /**
     * Distinct all assets found in HTML files
     */
    distinctAsset() {
        this.images = this.distinctAssetsBase((file) => file.images);
        this.scripts = this.distinctAssetsBase((file) => file.scripts);
        this.styles = this.distinctAssetsBase((file) => file.styles);
        return this;
    }
    /**
     * Distinct all assets found in CSS files
     */
    distinctStyleAsset() {
        // Merge assets from Stylesheets
        const styleImage = this.distinctStyleAssetsBase();
        if (styleImage.length > 0) {
            styleImage.forEach((asset, index, arr) => {
                let found = false;
                this.images.forEach((image, i, arr) => {
                    if (image.src === asset.src) {
                        found = true;
                    }
                });
                if (!found) {
                    this.images.push(asset);
                }
            });
        }
        return this;
    }
    /**
     * Distinct all assets
     * @param {filter} Filter function for assets
     */
    distinctAssetsBase(filter) {
        let assets = [];
        const clean = [];
        // HTML
        if (this.bundles.length > 0) {
            this.html.forEach((file, index, arr) => {
                assets = assets.concat(filter(file));
            });
            const group = helper.groupBy(assets, b => b.dest);
            const keys = group.keys();
            for (let i = 0; i < group.size; i++) {
                const dest = keys.next().value;
                const matches = group.get(dest);
                let found = false;
                if (this.bundles.length > 0) {
                    this.bundles.forEach((b, index, arr) => {
                        if (b.dest === matches[0].dest) {
                            found = true;
                            return;
                        }
                        b.files.forEach((f, ii, a) => {
                            if (f === matches[0].src) {
                                found = true;
                                return;
                            }
                        });
                        if (found) {
                            return;
                        }
                    });
                }
                if (!found) {
                    clean.push(matches[0]);
                }
            }
        }
        return clean;
    }
    /**
     * Distinct all assets for use with CSS
     */
    distinctStyleAssetsBase() {
        let assets = [];
        const clean = [];
        // CSS
        if (this.css.length > 0) {
            this.css.forEach((file, index, arr) => {
                assets = assets.concat(file.assets);
            });
            const group = helper.groupBy(assets, b => b.dest);
            const keys = group.keys();
            for (let i = 0; i < group.size; i++) {
                const dest = keys.next().value;
                const matches = group.get(dest);
                let found = false;
                if (this.bundles.length > 0) {
                    this.bundles.forEach((b, index, arr) => {
                        if (b.dest === matches[0].dest) {
                            found = true;
                            return;
                        }
                        b.files.forEach((f, ii, a) => {
                            if (f === matches[0].src) {
                                found = true;
                                return;
                            }
                        });
                        if (found) {
                            return;
                        }
                    });
                }
                if (!found) {
                    clean.push(matches[0]);
                }
            }
        }
        return clean;
    }
    //#endregion Distinct
    //#region Styles
    /**
     * Read all included style files
     */
    readStyles() {
        // Read bundles
        if (this.bundles.length > 0) {
            this.bundles.forEach((bundle, index, arr) => {
                if (bundle.type === "css") {
                    bundle.files.forEach((file, i, ar) => {
                        const style = {
                            src: file,
                            dest: bundle.dest,
                            name: bundle.name,
                            content: fs.readFileSync(file).toString(),
                            assets: [],
                            isInBundle: true,
                            isAssetReved: false,
                        };
                        // Add to project
                        this.css.push(style);
                    });
                }
            });
        }
        // Read other styles
        if (this.styles.length > 0) {
            this.styles.forEach((s, index, arr) => {
                if (s.type === "css") {
                    const style = {
                        src: s.src,
                        dest: s.dest,
                        name: s.name,
                        content: fs.readFileSync(s.src).toString(),
                        assets: [],
                        isInBundle: false,
                        isAssetReved: false,
                    };
                    // Add to project
                    this.css.push(style);
                }
            });
        }
        return this;
    }
    /**
     * Read all assets from included stylesheets
     */
    getStyleAssets() {
        if (this.css.length > 0) {
            this.css.forEach((css, index, arry) => {
                const rewriter = new URLRewriter(function (url) {
                    if (url.substring(0, 4) === "http" || url.substring(0, 2) === "//") {
                        return url;
                    }
                    const srcPath = helper.getPathFile("", css.src, url);
                    const destPath = helper.getPathFile("", css.dest, url);
                    css.assets.push({
                        html: css.name,
                        dest: destPath,
                        src: srcPath,
                        name: url,
                        type: path.extname(url).substring(1)
                    });
                    return url;
                });
                const result = rewriter.rewrite(css.content);
            });
        }
        return this;
    }
    //#endregion Styles
    //#region Rev
    /**
     * Calculate hash for assets.
     * @param {algorithm} string - Hash algorithm
     * @param {length} number - Suffix length
     * @param {process} function - Custom rename function: (file: string, suffix: string, ext: string) => string
     */
    revAssets(algorithm = "md5", length = 8, process) {
        if (this.images.length > 0) {
            this.images.forEach((image, index, arr) => {
                image.reved = helper.revAsset(image.src, algorithm, length, process);
                this.html.forEach((ht, index, arry) => {
                    ht.revSet((h) => h.images, image);
                });
            });
        }
        if (this.scripts.length > 0) {
            this.scripts.forEach((image, index, arr) => {
                image.reved = helper.revAsset(image.src, algorithm, length, process);
                this.html.forEach((ht, index, arry) => {
                    ht.revSet((h) => h.scripts, image);
                });
            });
        }
        if (this.styles.length > 0) {
            this.styles.forEach((image, index, arr) => {
                image.reved = helper.revAsset(image.src, algorithm, length, process);
                this.html.forEach((ht, index, arry) => {
                    ht.revSet((h) => h.styles, image);
                });
            });
        }
        return this;
    }
    /**
     * Calculate hash for bundles.
     * @param {algorithm} string - Hash algorithm
     * @param {length} number - Suffix length
     * @param {process} function - Custom rename function: (file: string, suffix: string, ext: string) => string
     */
    revBundles(algorithm = "md5", length = 8, process) {
        if (this.bundles.length > 0) {
            this.bundles.forEach((bundle, index, arr) => {
                // Calculate hash
                bundle.reved = helper.revAsset(bundle.dest, algorithm, length, process);
                let newDest = bundle.name.replace(path.basename(bundle.name), bundle.reved);
                let newName = bundle.convert;
                // Replace bundles in html
                if (this.html.length > 0 && bundle.reved != undefined) {
                    this.html.forEach((file, index, arry) => {
                        const assetSrc = helper.getPathAsset(file.name, newDest);
                        if (bundle.type === "css") {
                            newName = helper.templateStyle.replace("{0}", assetSrc);
                        }
                        else {
                            newName = helper.templateScript.replace("{0}", assetSrc);
                        }
                        file.content = file.content.replace(bundle.convert, newName);
                        // console.log("HTML: " + file.name + " Bundle: " + bundle.convert + " Reved: " + bundle.reved);
                        // Write file
                        const htmlFile = new HtmlFile()
                            .jsonLoad(file)
                            .write();
                    });
                    // Update convert
                    bundle.convert = newName;
                    // Rename bundle files
                    newDest = bundle.dest.replace(path.basename(bundle.dest), bundle.reved);
                    fs.renameSync(bundle.dest, newDest);
                    bundle.dest = newDest;
                }
            });
        }
        return this;
    }
    /**
     * Replace asset links in css and html files with reved name
     */
    revReplace() {
        if (this.css.length > 0) {
            this.css.forEach((css, index, arry) => {
                if (this.images.length > 0 && css.assets.length > 0 && !css.isInBundle) {
                    const images = this.images;
                    const rewriter = new URLRewriter(function (url) {
                        if (url.substring(0, 4) === "http" || url.substring(0, 2) === "//") {
                            return url;
                        }
                        let name = undefined;
                        images.forEach((img, index, arry) => {
                            if (img.name === url && img.reved != undefined && img.reved != "") {
                                name = url.replace(path.basename(img.dest), img.reved);
                            }
                        });
                        return name || url;
                    });
                    css.content = rewriter.rewrite(css.content);
                    css.isAssetReved = true;
                    const destPath = path.dirname(css.dest);
                    if (!fs.existsSync(destPath)) {
                        mkdirp.sync(destPath);
                    }
                    fs.writeFileSync(css.dest, css.content);
                }
            });
        }
        if (this.html.length > 0) {
            this.html.forEach((page, index, arry) => {
                page
                    .revReplace()
                    .write();
            });
        }
        return this;
    }
    /**
     * Replace asset links in bundle files with reved name
     */
    revReplaceBundles() {
        if (this.bundles.length > 0 && this.images.length > 0) {
            this.bundles.forEach((bundle, index, arry) => {
                if (bundle.type === "css" && fs.existsSync(bundle.dest)) {
                    // Replace assets in bundle
                    const images = this.images;
                    const rewriter = new URLRewriter(function (url) {
                        if (url.substring(0, 4) === "http" || url.substring(0, 2) === "//") {
                            return url;
                        }
                        let name = undefined;
                        images.forEach((img, index, arry) => {
                            if (img.name === url && img.reved != undefined && img.reved != "") {
                                name = url.replace(path.basename(img.dest), img.reved);
                            }
                        });
                        return name || url;
                    });
                    let content = fs.readFileSync(bundle.dest).toString();
                    content = rewriter.rewrite(content);
                    fs.writeFileSync(bundle.dest, content);
                }
            });
        }
        return this;
    }
    //#endregion Rev
    //#region Grunt Tasks
    /**
     * Read bundles and create grunt-contrib-concat configuration object.
     */
    gruntConcat() {
        if (this.bundles && this.bundles.length > 0) {
            const files = {};
            this.bundles.forEach((bundle, index, arry) => {
                files[bundle.dest] = bundle.files;
            });
            return {
                files: files
            };
        }
        return undefined;
    }
    /**
     * Read assets and create grunt-contrib-concat configuration object.
     */
    gruntCopy() {
        let assets = [];
        if (this.images.length > 0) {
            assets = assets.concat(this.images);
        }
        if (this.scripts.length > 0) {
            assets = assets.concat(this.scripts);
        }
        if (this.css.length > 0) {
            this.css.forEach((css, index, arry) => {
                if (!css.isAssetReved && !css.isInBundle) {
                    assets.push({
                        src: css.src,
                        dest: css.dest,
                        name: css.name,
                        type: "css",
                    });
                }
            });
        }
        if (assets && assets.length > 0) {
            const files = {};
            assets.forEach((asset, index, arry) => {
                files[asset.dest] = asset.src;
            });
            return {
                files: files
            };
        }
        return undefined;
    }
    /**
     * Read assets and create grunt-contrib-uglify configuration object.
     */
    gruntUglify() {
        let assets = [];
        if (this.scripts.length > 0) {
            assets = assets.concat(this.scripts);
        }
        if (this.bundles.length > 0) {
            this.bundles.forEach((bundle, index, arr) => {
                if (bundle.type === "js") {
                    assets.push(bundle);
                }
            });
        }
        if (assets && assets.length > 0) {
            const files = {};
            assets.forEach((asset, index, arry) => {
                files[asset.dest] = asset.dest;
            });
            return {
                files: files
            };
        }
        return undefined;
    }
    /**
     * Read assets and create grunt-contrib-cssmin configuration object.
     */
    gruntCssmin() {
        let assets = [];
        if (this.styles.length > 0) {
            assets = assets.concat(this.styles);
        }
        if (this.bundles.length > 0) {
            this.bundles.forEach((bundle, index, arr) => {
                if (bundle.type === "css") {
                    assets.push(bundle);
                }
            });
        }
        if (assets && assets.length > 0) {
            const files = {};
            assets.forEach((asset, index, arry) => {
                files[asset.dest] = asset.dest;
            });
            return {
                files: files
            };
        }
        return undefined;
    }
    /**
     * Read assets and create grunt-contrib-htmlmin configuration object.
     */
    gruntHtmlmin(opt = undefined) {
        if (this.html.length > 0) {
            const files = {};
            this.html.forEach((asset, index, arry) => {
                const dest = path.join(asset.dest, asset.name);
                files[dest] = dest;
            });
            return {
                options: opt || {},
                files: files
            };
        }
        return undefined;
    }
    /**
     * Read reved names and create grunt-contrib-rename configuration object.
     */
    gruntRename() {
        let assets = [];
        if (this.images.length > 0) {
            assets = assets.concat(this.images);
        }
        if (this.scripts.length > 0) {
            assets = assets.concat(this.scripts);
        }
        if (this.styles.length > 0) {
            assets = assets.concat(this.styles);
        }
        if (assets.length > 0) {
            const files = {};
            assets.forEach((asset, index, arry) => {
                const name = path.basename(asset.dest);
                const dest = asset.dest.replace(name, asset.reved);
                files[dest] = asset.dest;
            });
            return {
                files: files
            };
        }
        return undefined;
    }
    /**
     * Create configuration for makerev task.
     */
    gruntRev() {
        return {
            options: {
                project: this,
            }
        };
    }
}
exports.Project = Project;
class HtmlFile {
    constructor() {
        this.name = "";
        this.src = "";
        this.dest = "";
        this.content = "";
        // Assets
        this.bundles = [];
        this.images = [];
        this.scripts = [];
        this.styles = [];
    }
    jsonLoad(data) {
        Object.assign(this, data);
        return this;
    }
    /**
     * Read a html file.
     * @param {fileName} string - Path to HTML file relative to Source root
     * @param {srcRoot} string - Source root
     * @param {destRoot} string - Destination root
     */
    read(fileName, srcRoot = "", destRoot = "") {
        const fullPath = path.join(srcRoot, fileName);
        if (!fs.existsSync(fullPath)) {
            throw "Input file could not be found: " + fullPath;
        }
        this.src = srcRoot;
        this.dest = destRoot;
        this.name = fileName;
        this.content = fs.readFileSync(fullPath).toString();
        return this;
    }
    /**
     * Write html file to destination path
     */
    write() {
        const dest = path.join(this.dest, this.name);
        const destPath = path.dirname(dest);
        // Path
        if (!fs.existsSync(destPath)) {
            mkdirp.sync(destPath);
        }
        // File
        if (fs.existsSync(dest)) {
            fs.unlinkSync(dest);
        }
        fs.writeFileSync(dest, this.content);
        // grunt.file.write(dest, this.content);
        return this;
    }
    //#region Bundle
    /**
     * Convert all bundles to correct single include statement.
     */
    bundleConvert() {
        if (this.bundles && this.bundles.length > 0) {
            this.bundles.forEach((bundle, index, arry) => {
                if (bundle.files && bundle.files.length > 0) {
                    // Has files
                    const assetSrc = helper.getPathAsset(this.name, bundle.name);
                    bundle.dest = helper.getPathFile(this.dest, this.name, bundle.name);
                    if (bundle.type === "css") {
                        bundle.convert = helper.templateStyle.replace("{0}", assetSrc);
                    }
                    else {
                        bundle.convert = helper.templateScript.replace("{0}", assetSrc);
                    }
                }
            });
        }
        return this;
    }
    /**
     * Replace bundle definition
     */
    bundleReplace() {
        if (this.bundles && this.bundles.length > 0) {
            this.bundles.forEach((bundle, index, arry) => {
                const raw = bundle.raw.join("\n");
                const indent = (bundle.raw[0].match(/^\s*/) || [])[0];
                this.content = this.content.replace(raw, indent + bundle.convert);
            });
        }
        return this;
    }
    //#endregion Bundle
    //#region Rev
    /**
     * Get reved names from project and set them for the HTML file
     * @param {keyGetter} keyGetter
     * @param {reved} Reved asset from project
     */
    revSet(keyGetter, reved) {
        const assets = keyGetter(this);
        if (assets.length > 0) {
            assets.forEach((asset, index, array) => {
                if (asset.src === reved.src) {
                    asset.reved = reved.reved;
                }
            });
        }
        return this;
    }
    /**
     * Replace all asset link in  HTML file with correct reved one.
     */
    revReplace() {
        if (this.images.length > 0) {
            this.images.forEach((asset, index, arry) => {
                if (asset.reved != undefined && asset.reved != "") {
                    const name = asset.name.replace(path.basename(asset.src), asset.reved);
                    this.content = this.content.replace(asset.name, name);
                }
            });
        }
        if (this.scripts.length > 0) {
            this.scripts.forEach((asset, index, arry) => {
                if (asset.reved != undefined && asset.reved != "") {
                    const name = asset.name.replace(path.basename(asset.name), asset.reved);
                    this.content = this.content.replace(asset.name, name);
                }
            });
        }
        if (this.styles.length > 0) {
            this.styles.forEach((asset, index, arry) => {
                if (asset.reved != undefined && asset.reved != "") {
                    const name = asset.name.replace(path.basename(asset.name), asset.reved);
                    this.content = this.content.replace(asset.name, name);
                }
            });
        }
        return this;
    }
    /**
     * Replace all asset link in  HTML file with correct reved one.
     */
    revReplaceBundle() {
        if (this.bundles.length > 0) {
            this.bundles.forEach((asset, index, arry) => {
                if (asset.reved != undefined && asset.reved != "") {
                    const name = asset.name.replace(path.basename(asset.name), asset.reved);
                    this.content = this.content.replace(asset.name, name);
                }
            });
        }
        return this;
    }
    //#endregion Rev
    //#region Assets
    /**
     * Read all img tags
     */
    getImages() {
        this.images = this.getAssets("img[src]");
        return this;
    }
    /**
     * Read all linked stylesheets
     */
    getStyles() {
        this.styles = this.getAssets("link[rel=\"stylesheet\"]");
        return this;
    }
    /**
     * Read all linked stylesheets
     */
    getScripts() {
        this.scripts = this.getAssets("script[src]");
        return this;
    }
    /**
     * Read all elements found by given selector and extract href or src attribute
     */
    getAssets(selector) {
        // Load content
        const $ = cheerio.load(this.content);
        const found = $(selector);
        const assets = [];
        if (found && found.length > 0) {
            found.each((index, element) => {
                const name = element.attribs.href || element.attribs.src;
                const type = path.extname(name);
                const asset = {
                    html: this.name,
                    dest: helper.getPathFile(this.dest, this.name, name),
                    src: helper.getPathFile(this.src, this.name, name),
                    name: name,
                    type: type.substring(1)
                };
                assets.push(asset);
            });
        }
        return assets;
    }
    /**
     * Read content and extract all bundles information from it.
     */
    getBundles() {
        const lines = this.content.replace(/\r\n/g, "\n").split(/\n/);
        let inBlock = false;
        let bundle;
        lines.forEach((line, index, arr) => {
            const isStart = line.match(helper.matchBlockStart);
            const isStop = line.match(helper.matchBlockStop);
            // block start
            if (isStart) {
                inBlock = true;
                bundle = {
                    html: this.name,
                    name: isStart[3],
                    type: isStart[1],
                    files: [],
                    raw: [],
                    lineStart: index + 1
                };
            }
            if (inBlock) {
                bundle.raw.push(line);
                if (!isStart && !isStop) {
                    const isAsset = line.match(helper.matchAsset);
                    if (isAsset && isAsset[2]) {
                        bundle.files.push(helper.getPathFile(this.src, this.name, isAsset[2]));
                    }
                }
            }
            // block stop
            if (isStop) {
                inBlock = false;
                bundle.lineStop = index + 1;
                // Add block to list
                this.bundles.push(JSON.parse(JSON.stringify(bundle)));
            }
        });
        return this;
    }
}
exports.HtmlFile = HtmlFile;
//# sourceMappingURL=project.js.map