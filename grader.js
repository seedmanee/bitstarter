#!/usr/bin/env node

var fs = require('fs'),
    program = require('commander'),
    cheerio = require('cheerio'),
    rest = require("restler"),
    HTMLFILE_DEFAULT = "index.html",
    CHECKSFILE_DEFAULT = "checks.json";

// Make sure file exist
var assertFileExists = function(infile) {
  var instr = infile.toString();
  if(!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  }
  return instr;
};

var cheerioHtmlContent = function(html) {
  return cheerio.load(html);
};

var cheerioHtmlFile = function(htmlfile) {
  return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
  $ = cheerioHtmlFile(htmlfile);
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for(var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var checkUrl = function(url, checksfile) {

  rest.get(url).on("complete", function(result) {

    if (result instanceof Error) {
      this.retry(5000);
    } else {

      $ = cheerioHtmlContent(result);
      var checks = loadChecks(checksfile).sort();
      var out = {};
      for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;

      }

      var checkJson = out;
      var outJson = JSON.stringify(checkJson, null, 4);

      console.log(outJson);
    }
  });

};

var clone = function(fn) {
  // Workaround for commander.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};

if(require.main == module) {
  program
    .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <web_site>', 'Url of website')
    .parse(process.argv);

  if (program.url === undefined) {
    var checkJson = checkHtmlFile(program.file, program.checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
  } else {
    checkUrl(program.url, program.checks);
  }
} else {
  exports.checkHtmlFile = checkHtmlFile;
}
