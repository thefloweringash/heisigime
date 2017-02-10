import React from 'react';
import ReactDOMServer from 'react-dom/server';
import cheerio from 'cheerio';
import { App, css } from './app';
import template from 'raw-loader!../dist/index.html';

const mimicInsertCSS = (modules) => {
  const css_tags = [];
  for (const css_module of css) {
    const contents = css_module._getContent();
    for (let i = 0; i < contents.length; i++) {
      const [module_id, content] = contents[i];
      const id = `s${module_id}-${i}`;
      css_tags.push(`<style type="text/css" id=${id}>${content}</style>`);
    }
  }
  return css_tags;
}

export default () => {
  const $ = cheerio.load(template);
  $('#appcontainer').html(ReactDOMServer.renderToString(<App />));
  $('head style').remove();
  $('head').append(mimicInsertCSS(css).join(''));
  return $.html();
}
