export default {
  packageName: '@zz-common/native-adapter',
  methods: [
    {
      name: 'skipToUrl',
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
  ],
};
