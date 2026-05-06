// Mock for Cocos Creator 'cc' module

// _decorator mock
const ccclass = (name: string) => (cls: any) => cls;
const property = (options?: any) => (target: any, key: string) => {};

export const _decorator = { ccclass, property };

// Component mock
export class Component {
  node: any = {};
  onLoad() {}
  start() {}
  update(dt: number) {}
  onDestroy() {}
}

export class Node {}
