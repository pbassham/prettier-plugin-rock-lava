import { doc } from 'prettier';
import type { Doc, Printer } from 'prettier';
import { format as formatSql } from 'sql-formatter';
import { RawMarkupKinds } from '~/parser';
import { LavaHtmlNode, LavaParserOptions, NodeTypes } from '~/types';

const { hardline, join } = doc.builders;

// null will pass through
export const ParserMap: { [key in RawMarkupKinds]: string | null } = {
  [RawMarkupKinds.css]: 'css',
  [RawMarkupKinds.html]: null,
  [RawMarkupKinds.javascript]: 'babel',
  [RawMarkupKinds.json]: 'json',
  [RawMarkupKinds.markdown]: 'markdown',
  [RawMarkupKinds.typescript]: 'typescript',
  // SQL is formatted directly with `sql-formatter` rather than through a
  // Prettier parser, so it doesn't go through `textToDoc`. See `sqlToDoc`.
  [RawMarkupKinds.sql]: null,
  [RawMarkupKinds.text]: null,
};

// Rock RMS runs its `{% sql %}` command against SQL Server (T-SQL).
function sqlToDoc(value: string): Doc {
  const formatted = formatSql(value, {
    language: 'transactsql',
    keywordCase: 'upper',
  }).trim();
  return join(hardline, formatted.split('\n'));
}

export const embed: Printer<LavaHtmlNode>['embed'] = (path, options) => {
  return (textToDoc) => {
    const node = path.node as LavaHtmlNode;
    switch (node.type) {
      case NodeTypes.RawMarkup: {
        if (node.kind === RawMarkupKinds.sql && node.value.trim() !== '') {
          return sqlToDoc(node.value);
        }
        const parser = ParserMap[node.kind];
        if (parser && node.value.trim() !== '') {
          return textToDoc(node.value, {
            ...options,
            singleQuote: (options as LavaParserOptions).embeddedSingleQuote,
            parser,
            __embeddedInHtml: true,
          }).then((document) =>
            doc.utils.stripTrailingHardline(document),
          ) as Promise<Doc>;
        }
      }
      default:
        return undefined;
    }
  };
};
