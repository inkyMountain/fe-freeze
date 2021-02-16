/**
 * Create all possible import syntax regexp.
 * Example:
 * createImportRegExps(['Vue'], 'vue', true)
 * createImportRegExps(['Image', 'Button'], '@zz-common/zz-ui', false)
 */
export const createImportRegExps: ImportRegExpsCreator = (
  identifiers,
  packageName,
  isDefaultImport,
) => {
  const computedidentifiers = isDefaultImport
    ? identifiers[0]
    : `{${identifiers.map((identifier) => `(${identifier})`).join(',s+')}}`;
  const regExps = [];
  const esModuleRegExpSingleQuote = new RegExp(
    `import\\s+${computedidentifiers}\\s+from\\s+'${packageName}'`,
    'g'
    );
    const esModuleRegExpDoubleQuote = new RegExp(
      `import\\s+${computedidentifiers}\\s+from\\s+"${packageName}"`,
      'g'
  );
  // Temporarily ignore commonjs case to reduce work burden
  // const commonJsRegExpSingleQuote = new RegExp(
  //   `const\\s+${computedidentifiers}\\s+=\\srequire\\('${packageName}'\\)`,
  // );
  // const commonJsRegExpDoubleQuote = new RegExp(
  //   `const\\s+${computedidentifiers}\\s+=\\srequire\\("${packageName}"\\)`,
  // );
  regExps.push(
    esModuleRegExpSingleQuote,
    esModuleRegExpDoubleQuote,
    // commonJsRegExpDoubleQuote,
    // commonJsRegExpSingleQuote,
  );
  return regExps;
};

type ImportRegExpsCreator = (
  identifierss: string[],
  packageName: string,
  isDefaultImport: boolean,
) => RegExp[];
