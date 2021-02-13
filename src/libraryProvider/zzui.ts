const zzui: LibraryProvider = {
  packageName: '@zz-common/zz-ui',
  isDefaultImport: false,
  components: [
    {
      detail: 'zzui image组件',
      documentation: 'j',
      label: 'zzimage',
      name: 'Image',
      snippet: [
        '<z-image',
        '  class="$1"',
        '  width="$2"',
        '  height="$3"',
        '  px2rem',
        '  fit="${4| contain, cover |}"',
        '  :src="$5"',
        '  :set-pic-size="$2"',
        '/>',
      ],
    },
  ],
};

export default zzui;
