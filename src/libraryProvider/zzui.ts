const zzui: LibraryProvider = {
  packageName: '@zz-common/zz-ui',
  isDefaultImport: false,
  components: [
    {
      detail: 'zzui image组件',
      documentation: 'i',
      label: 'zimage',
      name: 'Image',
      snippet: [
        '<z-image',
        '  class="$1"',
        '  width="$2"',
        '  height="$3"',
        '  px2rem',
        '  fit="${4|contain,cover|}"',
        '  src="${5:https://pic1.zhuanstatic.com/xxx.png}"',
        '  :set-pic-size="$2"',
        '/>',
      ],
    },
    {
      detail: 'zzui button组件',
      documentation: 'b',
      label: 'zbutton',
      name: 'Button',
      snippet: [
        '<z-button class="${3:button}" @click="${2:onClickButton}">',
        '${1:按钮文案}',
        '</z-button>',
      ],
    },
  ],
};

export default zzui;
