const nativeAdapter: LibraryProvider = {
  packageName: '@zz-common/native-adapter',
  // if true, skipToUrl will be called as a method of the default imported object.
  // else skipToUrl will be imported as 'import {skipToUrl} from "packageName"'
  // and directly called.
  isDefaultImport: true,
  defaultImportVariableName: 'native',
  methods: [
    {
      label: 'skipToUrl',
      snippet: [
        'native.skipToUrl({',
        "  targetUrl: '${1:https://m.zhuanzhuan.com}',",
        "  needClose: ${2| '0', '1' |}",
        '})',
        '$0',
      ],
      detail: 'native adapter skipToUrl方法',
      documentation: '在App中会跳转到一个新的webview，在m页中会使用history对象进行跳转。',
    },
    {
      label: 'setTitle',
      snippet: ['native.setTitle({', "  title: '${1:webview标题}',", '})', '$0'],
      detail: '设置标题',
      documentation: '在App中会将webview标题设置成title属性的值，在m页中会对document.title进行赋值。',
    },
  ],
};

export default nativeAdapter;
