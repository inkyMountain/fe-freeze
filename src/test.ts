const regExp = new RegExp(
  // `import\\s+\\{.*Button.*\\}\\s+from\\s+'xxx'`,
  `import\\s+\\{.*Button.*\\}\\s+from\\s+'@zz-common/zz-ui'`,
  'g',
);
const result = `import {Button} from '@zz-common/zz-ui'`.match(regExp);
console.log('result', result);
