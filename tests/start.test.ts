import { start } from '../assets/scripts/start';
import { UIManager } from '../assets/scripts/UIManager';

describe('start - initmanager()', () => {
  let instance: start;

  beforeEach(() => {
    instance = new start();
  });

  it('should create a UIManager instance and assign it to uiManager', () => {
    // uiManager is initially undefined
    expect((instance as any).uiManager).toBeUndefined();

    instance['initmanager']();

    expect((instance as any).uiManager).toBeInstanceOf(UIManager);
  });

  it('should assign a new UIManager each time initmanager is called', () => {
    instance['initmanager']();
    const first = (instance as any).uiManager;

    instance['initmanager']();
    const second = (instance as any).uiManager;

    expect(first).not.toBe(second);
    expect(second).toBeInstanceOf(UIManager);
  });

  it('should not leave uiManager as undefined after calling initmanager', () => {
    instance['initmanager']();

    expect((instance as any).uiManager).toBeDefined();
    expect((instance as any).uiManager).not.toBeNull();
  });
});
