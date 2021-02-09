// import {parse} from './parser/htmlParser';
import {parse} from 'vue-eslint-parser';
const vueText = `
<template>
  <div class="test-component">{{data}}</div>
</template>

<script lang="ts">
  [''].map<string>(x => x);
  import native from '@zz-common/native-adapter';
  import Vue from 'vue'
  import {Component} from 'vue-property-decorator'

  [].map()

  @Component({
  name: 'TestComponent',
  })
  export default class TestComponent extends Vue {
  public mounted() {
    native.skipToUrl({
      targetUrl: 'https://m.zhuanzhuan.com',
      needClose:  '0'
    })
  }
  }
</script>

<style lang="less" scoped>
  .test-component {
  }
</style>
`;

console.time();
const result = parse(vueText, {
  sourceType: 'module',
  parser: '@typescript-eslint/parser',
});
console.timeEnd();
console.log('result', result);
