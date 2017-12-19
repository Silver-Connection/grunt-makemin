/*
 * grunt-makemin
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Silver Connection, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {
  // Internal lib.
  var pr = require('../lib/project');
  var defaultOptions = {
    assetRoot: "",
    logWrite: false,
    minCss: false,
    minJs: false,
    minHtml: false,
    minHtmlOptions: null,
    revAssets: false,
    revAlgorithm: 'md5',
    revLength: 8,
    revFunc: undefined
  };

  function addConfig(name, config) {
    var cfg = grunt.config.get(name) || {};
    if (config === undefined) {
      cfg["generated"] = { files: "" };
      return;
    }

    cfg["generated"] = config;
    grunt.config(name, cfg);
  }

  grunt.registerMultiTask('make-bundle', 'make-bundle primary task. Reads source files and assets', function () {
    var options = this.options(defaultOptions);
    var project = new pr.Project();
    // Iterate over all src-dest file pairs.
    this.files.forEach(function (fileContext) {
      var files = fileContext.src;
      files.forEach((file, index, arr) => {
        // Read file
        var htmlFile = new pr.HtmlFile();
        htmlFile = htmlFile
          // Read file
          .read(file, fileContext.cwd, fileContext.dest)
          // Get assets
          .getImages(options.assetRoot)
          .getStyles(options.assetRoot)
          .getScripts(options.assetRoot)
          .getBundles(options.assetRoot)
          // Convert blocks and replace
          .bundleConvert()
          .bundleReplace();

        grunt.log.write("Create \"" + file + "\" and replace \"" + htmlFile.bundles.length + "\" bundles...");

        htmlFile = htmlFile
          // Write file to dest
          .write();

        // Add to project
        project.html.push(htmlFile);

        grunt.log.ok();
      });
    });

    try {
      project = project
        // Distinct
        .distinctBundles()
        .distinctAsset()
        // Read styles
        .readStyles()
        .getStyleAssets()
        .distinctStyleAsset();

      if (options.revAssets) {
        grunt.log.write("Rev assets and replace links in HTML and CSS...");
        project = project
          .revAssets(options.revAlgorithm, options.revLength, options.revFunc)
          .revReplace();
        grunt.log.ok();
      }
    }
    catch (e) {
      grunt.log.error(e);
    }

    // config: concat
    var taskConfigs = project.gruntConcat();
    addConfig("concat", taskConfigs);
    if (taskConfigs !== undefined && Object.keys(taskConfigs.files).length > 0) {
      grunt.log.write("Generate concat configuration for \"" + Object.keys(taskConfigs.files).length + "\" bundles...");
      grunt.log.ok();
    }

    // config: copy
    // Copy other assets to destination
    taskConfigs = project.gruntCopy();
    addConfig("copy", taskConfigs);
    if (taskConfigs !== undefined && Object.keys(taskConfigs.files).length > 0) {
      grunt.log.write("Generate copy configuration for \"" + Object.keys(taskConfigs.files).length + "\" assets...");
      grunt.log.ok();
    }

    if (options.minJs) {
      // config: uglify
      taskConfigs = project.gruntUglify();
      if (taskConfigs !== undefined && Object.keys(taskConfigs.files).length > 0) {
        grunt.log.write("Generate uglify configuration for \"" + Object.keys(taskConfigs.files).length + "\" assets...");
        addConfig("uglify", taskConfigs);
        grunt.log.ok();
      }
    }

    if (options.minCss) {
      // config: cssmin
      taskConfigs = project.gruntCssmin();
      if (taskConfigs !== undefined && Object.keys(taskConfigs.files).length > 0) {
        grunt.log.write("Generate cssmin configuration for \"" + Object.keys(taskConfigs.files).length + "\" assets...");
        addConfig("cssmin", taskConfigs);
        grunt.log.ok();
      }
    }

    if (options.minHtml) {
      // config: htmlmin
      taskConfigs = project.gruntHtmlmin(options.minHtmlOptions);
      if (taskConfigs !== undefined && Object.keys(taskConfigs.files).length > 0) {
        grunt.log.write("Generate htmlmin configuration for \"" + Object.keys(taskConfigs.files).length + "\" assets...");
        addConfig("htmlmin", taskConfigs);
        grunt.log.ok();
      }
    }

    var logName = this.nameArgs.replace(":", "-") + "-log.json";
    if (options.revAssets) {
      // config: rename
      // used for file rev
      taskConfigs = project.gruntRename();
      if (taskConfigs !== undefined && Object.keys(taskConfigs.files).length > 0) {
        grunt.log.write("Generate rename configuration for \"" + Object.keys(taskConfigs.files).length + "\" assets...");
        addConfig("rename", taskConfigs);
        grunt.log.ok();
      }

      taskConfigs = project.gruntRev();
      taskConfigs.options.options = options;
      taskConfigs.options.logName = logName;
      addConfig("make-rev", taskConfigs);
    }

    if (options.logWrite) {
      grunt.file.write(this.nameArgs.replace(":", "-") + "-log.json", project.jsonWrite());
    }
  });

  grunt.registerMultiTask('make-rev', 'make-rev optional rev task. This will be auto generated', function () {
    var options = this.options();
    var project = new pr.Project();
    project.jsonLoad(options.project);

    grunt.log.write("Update reved assets in bundles...");
    project
      .revReplaceBundles();
    grunt.log.ok();

    grunt.log.write("Update HTML files with reved bundles...");
    project
      .revBundles(options.options.revAlgorithm, options.options.revLength, options.options.revFunc);
    grunt.log.ok();

    if (options.options.minJs) {
      // config: uglify
      var taskConfigs = project.gruntUglify();
      if (taskConfigs !== undefined && Object.keys(taskConfigs.files).length > 0) {
        grunt.log.write("Update uglify configuration for \"" + Object.keys(taskConfigs.files).length + "\" assets...");
        addConfig("uglify", taskConfigs);
        grunt.log.ok();
      }
    }

    if (options.options.minCss) {
      // config: cssmin
      var taskConfigs = project.gruntCssmin();
      if (taskConfigs !== undefined && Object.keys(taskConfigs.files).length > 0) {
        grunt.log.write("Update cssmin configuration for \"" + Object.keys(taskConfigs.files).length + "\" assets...");
        addConfig("cssmin", taskConfigs);
        grunt.log.ok();
      }
    }

    if (options.options.logWrite) {
      grunt.file.write(options.logName, project.jsonWrite());
    }
  });
};