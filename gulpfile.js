import { readFileSync, rmSync } from 'node:fs';

import gulp from 'gulp';
const { src, dest, watch, series, parallel } = gulp;

import fileInclude from 'gulp-file-include';
import htmlBeautify from 'gulp-html-beautify';
import bemlinter from 'gulp-html-bemlinter';
import htmlmin from 'gulp-htmlmin';

import autoprefixer from 'autoprefixer';
import plumber from 'gulp-plumber';
import postcss from 'gulp-postcss';
import gulpSass from 'gulp-sass';
import csso from 'postcss-csso';
import postUrl from 'postcss-url';
import * as dartSass from 'sass';
const sass = gulpSass(dartSass);

import sharp from 'gulp-sharp-responsive';
import { stacksvg } from 'gulp-stacksvg';
import svgo from 'gulp-svgmin';

import browserslistToEsbuild from 'browserslist-to-esbuild';
import { createGulpEsbuild } from 'gulp-esbuild';

import webpackStream from 'webpack-stream';
import webpackConfig from './webpack.config.js';

import server from 'browser-sync';

const PATH_TO_SOURCE = './source/';
const PATH_TO_DIST = './build/';
const PATH_TO_RAW = './raw/';
const PATHS_TO_STATIC = [
  `${PATH_TO_SOURCE}fonts/**/*.{woff2,woff}`,
  `${PATH_TO_SOURCE}*.ico`,
  `${PATH_TO_SOURCE}*.webmanifest`,
  `${PATH_TO_SOURCE}favicons/*.{png,svg}`,
  `${PATH_TO_SOURCE}vendor/**/*`,
  `${PATH_TO_SOURCE}img/**/*`,
  `${PATH_TO_SOURCE}data/**/*`,
  `!${PATH_TO_SOURCE}img/sprite/**/*`,
  `!${PATH_TO_SOURCE}**/README.md`,
];
let isDevelopment = true;

export function html() {
  return src([`${PATH_TO_SOURCE}**/*.html`, `!${PATH_TO_SOURCE}**/_*.html`])
    .pipe(plumber())
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file',
    }))
    .pipe(htmlBeautify({ indentSize: 2, }))
    .pipe(htmlmin({ collapseWhitespace: !isDevelopment }))
    .pipe(dest(PATH_TO_DIST))
    .pipe(server.stream());
}

export function lintBem() {
  return src(`${PATH_TO_SOURCE}*.html`)
    .pipe(bemlinter());
}

// For Pug
// import pug from 'gulp-pug';
// import cached from 'gulp-cached';
// export function htmlPug() {
//   return src(`${PATH_TO_SOURCE}pug/pages/*.pug`)
//     .pipe(plumber())
//     .pipe(pug({ pretty: true }))
//     .pipe(cached('pug'))
//     .pipe(htmlBeautify({ indentSize: 2, }))
//     .pipe(htmlmin({ collapseWhitespace: !isDevelopment }))
//     .pipe(dest(PATH_TO_DIST))
//     .pipe(server.stream());
// };

export function css() {
  return src(`${PATH_TO_SOURCE}scss/styles.scss`, { sourcemaps: isDevelopment })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      postUrl({ assetsPath: '../' }),
      autoprefixer(),
      csso()
    ]))
    .pipe(dest(`${PATH_TO_DIST}css`, { sourcemaps: isDevelopment }))
    .pipe(server.stream());
}

export function jsWebpack() {
  return src(`${PATH_TO_SOURCE}js/main.js`)
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig))
    .pipe(dest(`${PATH_TO_DIST}js`))
    .pipe(server.stream());
};


export function js() {
  const gulpEsbuild = createGulpEsbuild({ incremental: isDevelopment });

  return src(`${PATH_TO_SOURCE}js/*.js`)
    .pipe(gulpEsbuild({
      bundle: true,
      format: 'esm',
      // splitting: true,
      platform: 'browser',
      minify: !isDevelopment,
      sourcemap: isDevelopment,
      target: browserslistToEsbuild(),
    }))
    .pipe(dest(`${PATH_TO_DIST}js`))
    .pipe(server.stream());
}

export function optimizeRaster() {
  const RAW_DENSITY = 2;
  const TARGET_FORMATS = [undefined, 'webp', 'avif']; // undefined — initial format: jpg or png

  function createOptionsFormat() {
    const formats = [];

    for (const format of TARGET_FORMATS) {
      for (let density = RAW_DENSITY; density > 0; density--) {
        formats.push(
          {
            format,
            rename: { suffix: `@${density}x` },
            width: ({ width }) => Math.ceil(width * density / RAW_DENSITY),
            jpegOptions: { progressive: true },
          },
        );
      }
    }

    return { formats };
  }

  return src(`${PATH_TO_RAW}img/**/*.{png,jpg,jpeg}`)
    .pipe(sharp(createOptionsFormat()))
    .pipe(dest(`${PATH_TO_SOURCE}img`));
}

export function optimizeVector() {
  return src([`${PATH_TO_RAW}**/*.svg`])
    .pipe(svgo())
    .pipe(dest(PATH_TO_SOURCE));
}

export function sprite() {
  return src(`${PATH_TO_SOURCE}img/sprite/**/*.svg`)
    .pipe(stacksvg({ output: 'sprite' }))
    .pipe(dest(`${PATH_TO_DIST}img`));
}

export function copyAssets() {
  return src(PATHS_TO_STATIC, { base: PATH_TO_SOURCE })
    .pipe(dest(PATH_TO_DIST));
}

export function startServer() {
  server.init({
    server: {
      baseDir: PATH_TO_DIST
    },
    cors: true,
    notify: false,
    ui: false,
  }, (err, bs) => {
    bs.addMiddleware('*', (req, res) => {
      res.write(readFileSync(`${PATH_TO_DIST}404.html`));
      res.end();
    });
  });

  watch(`${PATH_TO_SOURCE}**/*.html`, series(html));
  watch(`${PATH_TO_SOURCE}scss/**/*.scss`, series(css));
  watch(`${PATH_TO_SOURCE}js/**/*.js`, series(jsWebpack));
  watch(`${PATH_TO_SOURCE}img/sprite/**/*.svg`, series(sprite, reloadServer));
  watch(PATHS_TO_STATIC, series(copyAssets, reloadServer));
}

function reloadServer(done) {
  server.reload();
  done();
}

export function removeBuild(done) {
  rmSync(PATH_TO_DIST, {
    force: true,
    recursive: true,
  });
  done();
}

export function build(done) {
  isDevelopment = false;
  series(
    removeBuild,
    parallel(
      html,
      css,
      jsWebpack,
      sprite,
      copyAssets,
    ),
  )(done);
}

export function start(done) {
  series(
    removeBuild,
    parallel(
      html,
      css,
      jsWebpack,
      sprite,
      copyAssets,
    ),
    startServer,
  )(done);
}



// export function startServer() {
//   server.init({
//     server: {
//       baseDir: PATH_TO_DIST
//     },
//     serveStatic: [
//       {
//         route: '/fonts',
//         dir: `${PATH_TO_SOURCE}fonts`,
//       },
//       {
//         route: '/*.ico',
//         dir: `${PATH_TO_SOURCE}*.ico`,
//       },
//       {
//         route: '/*.webmanifest',
//         dir: `${PATH_TO_SOURCE}*.webmanifest`,
//       },
//       {
//         route: '/favicons',
//         dir: `${PATH_TO_SOURCE}favicons`,
//       },
//       {
//         route: '/vendor',
//         dir: `${PATH_TO_SOURCE}vendor`,
//       },
//       {
//         route: '/img',
//         dir: `${PATH_TO_SOURCE}img`,
//       },
//     ],
//     cors: true,
//     notify: false,
//     ui: false,
//   }, (err, bs) => {
//     bs.addMiddleware('*', (req, res) => {
//       res.write(readFileSync(`${PATH_TO_DIST}404.html`));
//       res.end();
//     });
//   });

//   watch(`${PATH_TO_SOURCE}**/*.html`, series(html));
//   watch(`${PATH_TO_SOURCE}scss/**/*.scss`, series(css));
//   watch(`${PATH_TO_SOURCE}js/**/*.js`, series(js));
//   watch(`${PATH_TO_SOURCE}img/sprite/**/*.svg`, series(sprite, reloadServer));
//   watch(PATHS_TO_STATIC, series(copyAssets, reloadServer));
// }
