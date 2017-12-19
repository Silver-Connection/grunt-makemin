import * as path from "path";
import * as fs from "fs";
import * as pr from "../src/project";
import { } from "jest";

function getPath(f: string) {
    return path.join(__dirname, f);
}

function getPathFixtures(f: string) {
    return path.join(__dirname, "fixtures", f);
}

describe("class: HtmlFile", () => {
    describe("read()", () => {
        it("read(): Input file not found", () => {
            expect(() => {
                const htmlFile = new pr.HtmlFile();
                htmlFile.read("name");
            }).toThrowError("Input file could not be found: name");
        });

        it("read(): Read file", () => {
            let htmlFile = new pr.HtmlFile();
            htmlFile = htmlFile
                .read("block_clean.html", getPath("fixtures"));

            expect(htmlFile != undefined).toBe(true);
        });
    });

    describe("bundles", () => {
        describe("getBundles()", () => {
            it("getBundles(): Bundles from clean sample", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("block_clean.html", getPath("fixtures"))
                    .getBundles();

                expect(htmlFile != undefined).toBe(true);
                expect(htmlFile.bundles.length).toBe(4);

                let bundle = htmlFile.bundles[0];
                expect(bundle.name).toBe("/styles/c.css");
                expect(bundle.type).toBe("css");
                expect(bundle.files.length).toBe(2);
                let includes = bundle.files[0];
                expect(includes).toBe(getPathFixtures("/styles/c1.css"));
                includes = bundle.files[1];
                expect(includes).toBe(getPathFixtures("/styles/c2.css"));

                bundle = htmlFile.bundles[1];
                expect(bundle.name).toBe("~/styles/d.css");
                expect(bundle.type).toBe("css");
                expect(bundle.files.length).toBe(2);
                includes = bundle.files[0];
                expect(includes).toBe(getPathFixtures("/styles/d1.css"));
                includes = bundle.files[1];
                expect(includes).toBe(getPathFixtures("/styles/d2.css"));

                bundle = htmlFile.bundles[2];
                expect(bundle.name).toBe("scripts/a.js");
                expect(bundle.type).toBe("js");
                expect(bundle.files.length).toBe(2);
                includes = bundle.files[0];
                expect(includes).toBe(getPathFixtures("scripts/a1.js"));
                includes = bundle.files[1];
                expect(includes).toBe(getPathFixtures("scripts/a2.js"));

                bundle = htmlFile.bundles[3];
                expect(bundle.name).toBe("~/scripts/b.js");
                expect(bundle.type).toBe("js");
                expect(bundle.files.length).toBe(2);
                includes = bundle.files[0];
                expect(includes).toBe(getPathFixtures("b1.js"));
                includes = bundle.files[1];
                expect(includes).toBe(getPathFixtures("/scripts/b2.js"));
            });

            it("getBundles(): Bundle with empty lines", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("block_empty_line.html", getPath("fixtures"))
                    .getBundles();

                expect(htmlFile != undefined).toBe(true);
                expect(htmlFile.bundles.length).toBe(1);

                const bundle = htmlFile.bundles[0];
                expect(bundle.name).toBe("/styles/c.css");
                expect(bundle.type).toBe("css");
                expect(bundle.lineStart).toBe(1);
                expect(bundle.lineStop).toBe(7);
                expect(bundle.files.length).toBe(2);
                let includes = bundle.files[0];
                expect(includes).toBe(getPathFixtures("/styles/c1.css"));
                includes = bundle.files[1];
                expect(includes).toBe(getPathFixtures("/styles/c2.css"));
            });
        });

        describe("bundleConvert()", () => {
            it("bundleConvert(): Styles absolute paths", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile.src = "tmp/flat";
                htmlFile.dest = "tmp/flat-result";
                htmlFile.name = "index.html";
                htmlFile.bundles = [{
                    name: "/styles/c.css",
                    type: "css",
                    files: ["/styles/c1.css", "/styles/c2.css"]
                }, {
                    name: "~/styles/d.css",
                    type: "css",
                    files: ["~/styles/d1.css", "~/styles/d2.css"]
                }];

                htmlFile = htmlFile.bundleConvert();
                expect(htmlFile.bundles).toHaveLength(2);

                let bundle = htmlFile.bundles[0];
                expect(bundle.convert).toBe('<link rel="stylesheet" type="text/css" href="/styles/c.css">');

                bundle = htmlFile.bundles[1];
                expect(bundle.convert).toBe('<link rel="stylesheet" type="text/css" href="~/styles/d.css">');
            });

            it("bundleConvert(): Styles relative paths", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile.src = "tmp/flat";
                htmlFile.dest = "tmp/flat-result";
                htmlFile.name = "sub/page-1.html";
                htmlFile.bundles = [{
                    name: "~/styles/c.css",
                    type: "css",
                    files: ["c1.css", "~/styles/c2.css"]
                }, {
                    name: "d.css",
                    type: "css",
                    files: ["d1.css", "/styles/d2.css"]
                }];

                htmlFile = htmlFile.bundleConvert();
                expect(htmlFile.bundles).toHaveLength(2);

                let bundle = htmlFile.bundles[0];
                expect(bundle.convert).toBe('<link rel="stylesheet" type="text/css" href="~/styles/c.css">');

                bundle = htmlFile.bundles[1];
                expect(bundle.convert).toBe('<link rel="stylesheet" type="text/css" href="/sub/d.css">');
            });

            it("bundleConvert(): Scripts absolute paths", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile.src = "tmp/flat";
                htmlFile.dest = "tmp/flat-result";
                htmlFile.name = "index.html";
                htmlFile.bundles = [{
                    name: "/scripts/c.js",
                    type: "js",
                    files: ["/scripts/c1.js", "/scripts/c2.js"]
                }, {
                    name: "~/scripts/d.js",
                    type: "js",
                    files: ["~/scripts/d1.js", "~/scripts/d2.js"]
                }];

                htmlFile = htmlFile.bundleConvert();
                expect(htmlFile.bundles).toHaveLength(2);

                let bundle = htmlFile.bundles[0];
                expect(bundle.convert).toBe('<script src="/scripts/c.js"></script>');

                bundle = htmlFile.bundles[1];
                expect(bundle.convert).toBe('<script src="~/scripts/d.js"></script>');
            });

            it("bundleConvert(): Styles relative paths", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile.src = "tmp/flat";
                htmlFile.dest = "tmp/flat-result";
                htmlFile.name = "sub/page-1.html";
                htmlFile.bundles = [{
                    name: "~/scripts/c.js",
                    type: "js",
                    files: ["c1.js", "~/scripts/c2.js"]
                }, {
                    name: "d.js",
                    type: "js",
                    files: ["d1.js", "/scripts/d2.js"]
                }];

                htmlFile = htmlFile.bundleConvert();
                expect(htmlFile.bundles).toHaveLength(2);

                let bundle = htmlFile.bundles[0];
                expect(bundle.convert).toBe('<script src="~/scripts/c.js"></script>');

                bundle = htmlFile.bundles[1];
                expect(bundle.convert).toBe('<script src="/sub/d.js"></script>');
            });
        });

        describe("bundleReplace()", () => {
            it("bundleReplace(): Clean replace", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("index.html", getPath("fixtures/replace"))
                    .getBundles()
                    .bundleConvert()
                    .bundleReplace();

                const correct = fs.readFileSync(getPath("expected/replace/index.html")).toString();
                expect(htmlFile.content).toBe(correct);
            });
        });
    });

    describe("getAssets()", () => {
        describe("HTML", () => {
            it("getStyles(): HTML - Find all styles", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("sub/getStyles_clean.html", getPath("fixtures"))
                    .getStyles();

                expect(htmlFile.styles).toHaveLength(3);

                let asset = htmlFile.styles[0];
                expect(asset.name).toBe("~/styles/c1.css");
                expect(asset.type).toBe("css");
                expect(asset.html).toBe("sub/getStyles_clean.html");
                expect(asset.dest).toBe("/styles/c1.css");

                asset = htmlFile.styles[1];
                expect(asset.name).toBe("/styles/c2.css");
                expect(asset.type).toBe("css");
                expect(asset.html).toBe("sub/getStyles_clean.html");
                expect(asset.dest).toBe("styles/c2.css");

                asset = htmlFile.styles[2];
                expect(asset.name).toBe("c3.css");
                expect(asset.type).toBe("css");
                expect(asset.html).toBe("sub/getStyles_clean.html");
                expect(asset.dest).toBe("sub/c3.css");
            });

            it("getScripts(): HTML - Find all scripts", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("sub/getScripts_clean.html", getPath("fixtures"))
                    .getScripts();

                expect(htmlFile.scripts).toHaveLength(3);

                let asset = htmlFile.scripts[0];
                expect(asset.name).toBe("~/scripts/a1.js");
                expect(asset.type).toBe("js");
                expect(asset.html).toBe("sub/getScripts_clean.html");
                expect(asset.dest).toBe("/scripts/a1.js");

                asset = htmlFile.scripts[1];
                expect(asset.name).toBe("/scripts/a2.js");
                expect(asset.type).toBe("js");
                expect(asset.html).toBe("sub/getScripts_clean.html");
                expect(asset.dest).toBe("scripts/a2.js");

                asset = htmlFile.scripts[2];
                expect(asset.name).toBe("a3.js");
                expect(asset.type).toBe("js");
                expect(asset.html).toBe("sub/getScripts_clean.html");
                expect(asset.dest).toBe("sub/a3.js");
            });

            it("getImages(): HTML - Find all images and fonts", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("template/index.html", getPath("fixtures"))
                    .getImages();

                expect(htmlFile.images).toHaveLength(9);

                const asset = htmlFile.images[0];
                expect(asset.name).toBe("images/logo.png");
                expect(asset.type).toBe("png");
                expect(asset.html).toBe("template/index.html");
                expect(asset.dest).toBe("template/images/logo.png");
            });

            it("getStyles(): HTML - Find all styles, skip invalid ones", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("assets.html", getPath("fixtures"))
                    .getStyles();

                expect(htmlFile.styles).toHaveLength(1);

                const asset = htmlFile.styles[0];
                expect(asset.name).toBe("~/styles/c1.css");
                expect(asset.type).toBe("css");
                expect(asset.html).toBe("assets.html");
                expect(asset.dest).toBe("/styles/c1.css");
            });

            it("getImages(): HTML - Find all images and other assets, skip invalid ones", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("assets.html", getPath("fixtures"))
                    .getImages();

                expect(htmlFile.images).toHaveLength(2);

                let asset = htmlFile.images[0];
                expect(asset.name).toBe("/favicons/apple-icon-72x72.png");
                expect(asset.type).toBe("png");
                expect(asset.html).toBe("assets.html");
                expect(asset.dest).toBe("favicons/apple-icon-72x72.png");

                asset = htmlFile.images[1];
                expect(asset.name).toBe("/favicons/android-icon-72x72.png");
                expect(asset.type).toBe("png");
                expect(asset.html).toBe("assets.html");
                expect(asset.dest).toBe("favicons/android-icon-72x72.png");
            });

            it("getImages(): HTML - Set optional asset root path", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("assets.html", getPath("fixtures"))
                    .getImages("wwwroot");

                expect(htmlFile.images).toHaveLength(2);

                let asset = htmlFile.images[0];
                expect(asset.name).toBe("/favicons/apple-icon-72x72.png");
                expect(asset.type).toBe("png");
                expect(asset.html).toBe("assets.html");
                expect(asset.dest).toBe("wwwroot/favicons/apple-icon-72x72.png");

                asset = htmlFile.images[1];
                expect(asset.name).toBe("/favicons/android-icon-72x72.png");
                expect(asset.type).toBe("png");
                expect(asset.html).toBe("assets.html");
                expect(asset.dest).toBe("wwwroot/favicons/android-icon-72x72.png");
            });

            it("getScripts(): HTML - Set optional asset root path and file in sub directory", () => {
                let htmlFile = new pr.HtmlFile();
                htmlFile = htmlFile
                    .read("sub/getScripts_clean.html", getPath("fixtures"))
                    .getScripts("wwwroot");

                expect(htmlFile.scripts).toHaveLength(3);

                let asset = htmlFile.scripts[0];
                expect(asset.name).toBe("~/scripts/a1.js");
                expect(asset.type).toBe("js");
                expect(asset.html).toBe("sub/getScripts_clean.html");
                expect(asset.dest).toBe("wwwroot/scripts/a1.js");

                asset = htmlFile.scripts[1];
                expect(asset.name).toBe("/scripts/a2.js");
                expect(asset.type).toBe("js");
                expect(asset.html).toBe("sub/getScripts_clean.html");
                expect(asset.dest).toBe("wwwroot/scripts/a2.js");

                asset = htmlFile.scripts[2];
                expect(asset.name).toBe("a3.js");
                expect(asset.type).toBe("js");
                expect(asset.html).toBe("sub/getScripts_clean.html");
                expect(asset.dest).toBe("wwwroot/sub/a3.js");
            });
        });

        describe("CSS", () => {
            it("getImages(): CSS - Find all images and fonts", () => {
                let project = new pr.Project();
                project.css.push({
                    "src": "styles/urls.css",
                    "dest": "tmp/styles/urls.css",
                    "name": "urls.css",
                    "content": fs.readFileSync(path.join(getPath("fixtures"), "styles/urls.css")).toString(),
                    "assets": [],
                    "isInBundle": false,
                    "isAssetReved": false
                });

                project = project
                    .getStyleAssets()
                    .distinctStyleAsset();

                expect(project.images).toHaveLength(3);

                let asset = project.images[0];
                expect(asset.name).toBe("/images/test.png");
                expect(asset.type).toBe("png");
                expect(asset.html).toBe("urls.css");
                expect(asset.dest).toBe("images/test.png");

                asset = project.images[1];
                expect(asset.name).toBe("images/test.png");
                expect(asset.type).toBe("png");
                expect(asset.html).toBe("urls.css");
                expect(asset.dest).toBe("tmp/styles/images/test.png");

                asset = project.images[2];
                expect(asset.name).toBe("/images/param.png?v=8");
                expect(asset.type).toBe("png");
                expect(asset.html).toBe("urls.css");
                expect(asset.dest).toBe("images/param.png");
            });
        });
    });
});

describe("class: Project", () => {
    describe("distinctBundles()", () => {
        it("distinctBundles(): Clean bundles with identical duplicates", () => {
            const data = JSON.parse(fs.readFileSync(getPath("fixtures/distinct_clean.json")).toString());
            let project = new pr.Project();
            project = project
                .jsonLoad(data)
                .distinctBundles();

            expect(project.bundles).toHaveLength(4);

            let bundle = project.bundles[0];
            expect(bundle.name).toBe("/styles/c.css");
            expect(bundle.dest).toBe("tmp/sub-result/styles/c.css");
            expect(bundle.files).toHaveLength(2);
            expect(bundle.files[0]).toBe("tmp/sub/styles/c1.css");
            expect(bundle.files[1]).toBe("tmp/sub/styles/c2.css");

            bundle = project.bundles[1];
            expect(bundle.name).toBe("~/scripts/a.js");
            expect(bundle.dest).toBe("tmp/sub-result/scripts/a.js");
            expect(bundle.files).toHaveLength(2);
            expect(bundle.files[0]).toBe("tmp/sub/scripts/a1.js");
            expect(bundle.files[1]).toBe("tmp/sub/scripts/a2.js");

            bundle = project.bundles[2];
            expect(bundle.name).toBe("~/styles/d.css");
            expect(bundle.dest).toBe("tmp/sub-result/styles/d.css");
            expect(bundle.files).toHaveLength(2);
            expect(bundle.files[0]).toBe("tmp/sub/sub/d1.css");
            expect(bundle.files[1]).toBe("tmp/sub/sub/d2.css");

            bundle = project.bundles[3];
            expect(bundle.name).toBe("b.js");
            expect(bundle.dest).toBe("tmp/sub-result/sub/b.js");
            expect(bundle.files).toHaveLength(2);
            expect(bundle.files[0]).toBe("tmp/sub/sub/b1.js");
            expect(bundle.files[1]).toBe("tmp/sub/sub/b2.js");
        });

        it("distinctBundles(): Duplicate bundle with different assets", () => {
            const data = JSON.parse(fs.readFileSync(getPath("fixtures/distinct_asset_different.json")).toString());
            let project = new pr.Project();
            project = project.jsonLoad(data);
            expect(() => {
                project = project.distinctBundles();
            }).toThrow();
        });

        it("distinctBundles(): Duplicate bundle with missing assets", () => {
            const data = JSON.parse(fs.readFileSync(getPath("fixtures/distinct_asset_missing.json")).toString());
            let project = new pr.Project();
            project = project.jsonLoad(data);
            expect(() => {
                project = project.distinctBundles();
            }).toThrow();
        });
    });
});
