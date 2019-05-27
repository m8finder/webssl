// https://github.com/zeit/ncc

require('@zeit/ncc')('./cli.js', {
  cache: './.cache',
  externals: ['externalpackage'], // externals to leave as requires of the build
  minify: true,
  sourceMap: false,
  watch: false,
  v8cache: false,
  quiet: false,
}).then(({ code, map, assets }) => {
  console.log(code)
  // Assets is an object of asset file names to { source, permissions, symlinks }
  // expected relative to the output code (if any)
})
