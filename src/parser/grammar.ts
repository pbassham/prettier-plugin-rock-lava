import ohm from 'ohm-js';

export const lavaHtmlGrammars = ohm.grammars(
  require('../../grammar/lava-html.ohm.js'),
);

export interface LavaGrammars {
  Lava: ohm.Grammar;
  LavaHTML: ohm.Grammar;
  LavaStatement: ohm.Grammar;
}

export const strictGrammars: LavaGrammars = {
  Lava: lavaHtmlGrammars['StrictLava'],
  LavaHTML: lavaHtmlGrammars['StrictLavaHTML'],
  LavaStatement: lavaHtmlGrammars['StrictLavaStatement'],
};

export const tolerantGrammars: LavaGrammars = {
  Lava: lavaHtmlGrammars['Lava'],
  LavaHTML: lavaHtmlGrammars['LavaHTML'],
  LavaStatement: lavaHtmlGrammars['LavaStatement'],
};

export const placeholderGrammars: LavaGrammars = {
  Lava: lavaHtmlGrammars['WithPlaceholderLava'],
  LavaHTML: lavaHtmlGrammars['WithPlaceholderLavaHTML'],
  LavaStatement: lavaHtmlGrammars['WithPlaceholderLavaStatement'],
};

// see ../../grammar/lava-html.ohm for full list
export const BLOCKS = (
  strictGrammars.LavaHTML.rules as any
).blockName.body.factors[0].terms.map((x: any) => x.obj) as string[];

// see ../../grammar/lava-html.ohm for full list
export const RAW_TAGS = (
  strictGrammars.LavaHTML.rules as any
).lavaRawTag.body.terms
  .map((term: any) => term.args[0].obj)
  .concat('comment') as string[];

// see ../../grammar/lava-html.ohm for full list
export const VOID_ELEMENTS = (
  strictGrammars.LavaHTML.rules as any
).voidElementName.body.factors[0].terms.map(
  (x: any) => x.args[0].obj,
) as string[];

// Note: 'comment' is deliberately absent — a one-line `comment ... endcomment`
// statement inside a {% lava %} tag carries its comment text in the markup,
// which the printer needs to convert it to a `//-` comment.
//
// The raw tags (raw, javascript, style, stylesheet, sql) are also absent:
// unlike Shopify Liquid, Rock's raw tags take named parameters (e.g.
// `{% javascript url:'...' id:'...' %}`, `{% sql return:'x' %}`) that must
// survive formatting.
export const TAGS_WITHOUT_MARKUP = ['else', 'break', 'continue'];
