/*
 * grunt-makemin
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Silver Connection, contributors
 * Licensed under the MIT license.
 */

export interface AssetBase {
    html?: string;
    dest?: string;
    name?: string;
    type?: string;
    reved?: string;
}

export interface AssetFile extends AssetBase {
    src?: string;
}

export interface BundleFile extends AssetBase {
    convert?: string;
    files?: string[];
    lineStart?: number;
    lineStop?: number;
    raw?: string[];
}

export interface ProjectFile {
    src: string;
    dest: string;
    name: string;
    content: string;
}

export interface StyleFile extends ProjectFile {
    assets?: Array<AssetFile>;
    isInBundle: boolean;
    isAssetReved?: boolean;
}

export interface HtmlFile extends ProjectFile {
    bundles?: Array<BundleFile>;
    images?: Array<AssetFile>;
    scripts?: Array<AssetFile>;
    styles?: Array<AssetFile>;
}

export interface Project {
    src: string;
    dest: string;

    html?: Array<HtmlFile>;
    css?: Array<StyleFile>;

    bundles?: Array<BundleFile>;
    images?: Array<AssetFile>;
    scripts?: Array<AssetFile>;
    styles?: Array<AssetFile>;
}

export declare function FuncRevRename(file: string, suffix: string, ext: string): string;