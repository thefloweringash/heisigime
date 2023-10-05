import React from 'react';
import ReactDOMServer from 'react-dom/server';
import cheerio from 'cheerio';
import { App } from '../js/app';
import fs from 'fs';

const render = (template) => {
  const $ = cheerio.load(template);
  $('#appcontainer').html(ReactDOMServer.renderToString(<App />));
  return $.html();
}

const main = () => {
  try {
    console.log('Pre-rendering index');
    const template = fs.readFileSync("dist/index.html");
    const result = render(template);
    fs.writeFileSync("dist/index.html", result);
  }
  catch (e) {
    console.error(`Error generating index: ${e}`);
    throw e;
  }
}

main();
