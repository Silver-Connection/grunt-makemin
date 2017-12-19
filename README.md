grunt-makemin
--

<!-- TOC -->

- [Installation](#installation)
- [Usage](#usage)
    - [Grunt](#grunt)
        - [Flow](#flow)
    - [Bundle](#bundle)
- [Options](#options)
- [Samples](#samples)

<!-- /TOC -->

This is a grunt task. You need grunt to run this. This tool is inspired by [grunt-usemin](https://github.com/yeoman/grunt-usemin). Unfortunately ```usemin``` is not maintained any more for some time. So we have come up with a new tool to fit as a replacement. We have also included functionality from [grunt-filerev](https://github.com/yeoman/grunt-filerev). 

Important to know is that ```makemin``` extracts all assets (styles, scripts, images...) from the given source files (HTML), ```usemin``` scans given directories for assets. So ```makemin``` only processes linked assets, unlinked assets are not processed.

This is what ```makemin``` will do for you:

1. Read bundle definitions, and concat all sources.
2. Copy all assets linked in the source files, to the destination directory.
3. Minify Javascript, CSS and HTML
4. Rev all assets and update links

For parsing the HTML files we use [cheerio.js](https://cheerio.js.org/). [cheerio.js](https://cheerio.js.org/) is great tool which will allow us much better parsing than any regular expression matching. For CSS parsing we use [cssurl](https://github.com/nzakas/cssurl), which also uses tokens over regular expression which is great!

## Installation

We need some other grunt task in order to make thinks work, and yes we also need [Grunt](https://gruntjs.com) :)

- grunt-contrib-copy
- grunt-contrib-concat
- grunt-contrib-rename
- grunt-contrib-uglify
- grunt-contrib-cssmin
- grunt-contrib-htmlmin

## Usage

The ```make-bundle``` task auto generates some other task targets, you have to call them in your registered tasks. The order of the task is important, so make sure it is correct.

The given sample will read all HTML files in ```wwwroot-src``` and will copy all processed files (styles, scripts, images...) to ```wwwroot-dest``` maintaining the original directory structure. We have also enabled log writing, so after the task is completed a file called ```make-bundle-sample.json``` will be written to project root.

### Grunt

```javascript
// Configuration to be run (and then tested).
"make-bundle": {
    sample: {
        cwd: "wwwroot-src",
        src: "{,*/}*.html",
        dest: "wwwroot-dest",
        options: {
            assetRoot: "",
            logWrite: true,
            minCss: true,
            minJs: true,
            minHtml: true,
            minHtmlOptions: {
                removeComments: true,
                collapseWhitespace: true
            },
            revAssets: true,
            revAlgorithm: "md5",
            revLength: 8
        }
    },
},

//...

// Task order
grunt.registerTask("default", [
    "make-bundle:sample",
    "concat:generated",
    "copy:generated",
    "make-rev:generated",
    "uglify:generated",
    "cssmin:generated",
    "htmlmin:generated",
    "rename:generated",
]);
```

#### Flow

Unlike ```usemin``` you can not set a custom flow. This wont make sense in our case and will break some functions. This is the flow:

1. ```make-bundle```: Reads all sources, extracts assets and bundles, configure task targets.
2. ```concat:generated```: Generates bundle files in destination path.
3. ```copy:generated```: Copies all other assets to destination.
4. ```make-rev:generated```: (optional) Updates assets link with reved ones.
5. ```uglify:generated```: (optional) Run javascript minification.
6. ```cssmin:generated```: (optional) Run CSS minification.
7. ```htmlmin:generated```: (optional) Run HTML minification.
8. ```rename:generated```: (optional) Rename assets when using file rev.

### Bundle

We use the same syntax as ```usemin```, but we currently only process CSS and Javascript. 

```html 

<!DOCTYPE html>

<head>
    <!-- build:css /styles/c.css -->
    <link rel="stylesheet" href="/styles/c1.css">
    <link rel="stylesheet" href="/styles/c2.css">
    <!-- endbuild -->
</head>

<body>
    <!-- build:js ~/scripts/a.js -->
    <script src="~/scripts/a1.js"></script>
    <script src="/a2.js"></script>
    <!-- endbuild -->
</body>

</html>

```

Relative and absolute path are supported for all assets. Relative paths are resolved using the source file path. Tilde ```~``` is also supported, indicating a absolute path.


## Options

You can set some options, to enable some functionalities.

| Option | Type | Description |
|-|-|-|
|assetRoot| string | Optional relative path from source (cwd) to assets |
|minCss| boolean | Generate ```cssmin``` configuration |
|minJs| boolean | Generate ```uglify``` configuration |
|minHtml| boolean | Generate ```htmlmin``` configuration |
|minHtmlOptions| object | Please have look at [html-minifier](https://github.com/kangax/html-minifier#options-quick-reference) |
|revAssets| boolean | Enable asset rev |
|revAlgorithm| string | algorithm is dependent on the available algorithms supported by the version of OpenSSL on the platform. Examples are 'sha1', 'md5', 'sha256', 'sha512', etc. On recent releases, openssl list-message-digest-algorithms will display the available digest algorithms. |
|revLength| boolean | Number of characters of the file hash to prefix the file name with. |
|revFunc| function | Function to process the revised file name and return back the new file name. Type: (basename: string, name: string, extension: string) => string |
|logWrite| boolean | Write project data to disk. This used for debug and testing |

If you want to configure the ```cssmin``` or ```uglify``` task you can do so with a global option for this tasks in your Gruntfile:

```js
"cssmin": {
    options: {
        // Put here global settings
    },
    target: {
        ...
    }
},

"uglify": {
    options: {
        // Put here global settings
    },
    target: {
        ...
    }
}
```

## Samples

You can find some samples on [github](https://github.com/Silver-Connection/grunt-makemin) in the ```sample``` directory.