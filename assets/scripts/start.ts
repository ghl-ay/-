import { _decorator, Button, Component, Label, Node, Prefab, input, Input, KeyCode, EventKeyboard } from 'cc';
import { UIManager } from './UIManager';
import { eggManager } from './eggManager';
import { snakeManager } from './snakeManager';
import { snakeView } from './snakeView';
import { floatingText } from './floatingText';
const { ccclass, property } = _decorator;

@ccclass('start')
export class start extends Component {

    // 得分标签
    @property({ type: Label, tooltip: '得分标签' })
    scoreLabel: Label = null;

    // 开始按钮
    @property({ type: Button, tooltip: '开始按钮' })
    startbutton: Button = null;

    // 蛋预制体
    @property({ type: Prefab, tooltip: '蛋' })
    egg: Prefab = null;

    // 蛋的父节点
    @property({ type: Node, tooltip: '蛋的父节点' })
    eggParent: Node = null;

    // 蛇头预制体
    @property({ type: Prefab, tooltip: '蛇头预制体' })
    snakeHead: Prefab = null;

    // 蛇身预制体
    @property({ type: Prefab, tooltip: '蛇身预制体' })
    snakeBody: Prefab = null;

    // 蛇的父节点
    @property({ type: Node, tooltip: '蛇的父节点' })
    snakeParent: Node = null;

    // 移动间隔(秒)
    @property({ tooltip: '蛇移动间隔(秒)' })
    moveInterval: number = 0.3;

    private uiManager: UIManager;
    private eggMgr: eggManager;
    private snakeMgr: snakeManager;
    private snakeViewCtrl: snakeView;
    private isPlaying: boolean = false;
    private moveTimer: number = 0;

    protected onLoad(): void {
        this.initManager();
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    protected initManager() {
        this.uiManager = new UIManager(this.scoreLabel, this.startbutton);
        this.eggMgr = new eggManager(this.egg, this.eggParent);
        this.snakeMgr = new snakeManager();
        this.snakeViewCtrl = new snakeView(this.snakeHead, this.snakeBody, this.snakeParent);
    }

    /** 点击开始按钮 */
    onStarClick() {
        console.log('start game');
        this.startGame();
    }

    /** 开始游戏 */
    private startGame() {
        this.isPlaying = true;
        this.moveTimer = 0;

        // 初始化蛇
        this.snakeMgr.init();
        this.snakeViewCtrl.init();
        this.snakeViewCtrl.updateView(this.snakeMgr);

        // 隐藏UI，显示分数
        this.uiManager.hideScoreLabel();
        this.uiManager.resetScore();
        this.uiManager.showScore();

        // 清除旧蛋，生成新蛋
        this.eggMgr.removeEgg();
        this.eggMgr.spawnEgg(this.snakeMgr.getBodyPositions());
    }

    /** 每帧更新，驱动蛇移动 */
    protected update(dt: number): void {
        if (!this.isPlaying) return;

        this.moveTimer += dt;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer -= this.moveInterval;
            this.gameTick();
        }

        // 每帧平滑插值渲染，t = 当前 tick 内的进度
        const t = this.moveTimer / this.moveInterval;
        this.snakeViewCtrl.updateViewSmooth(this.snakeMgr, t);
    }

    /** 每个游戏 tick 的逻辑 */
    private gameTick() {
        // 蛇移动
        const alive = this.snakeMgr.move();

        if (!alive) {
            this.gameOver();
            return;
        }

        // 检测吃蛋
        const headPos = this.snakeMgr.getHeadPosition();
        if (this.eggMgr.isEaten(headPos)) {
            // 飘字 +1 效果（用 eggParent 作为父节点保证坐标系一致，复用 scoreLabel 字体）
            const eggWorldPos = snakeManager.gridToWorld(headPos.col, headPos.row);
            floatingText.show(this.eggParent, '+1', eggWorldPos.x, eggWorldPos.y, this.scoreLabel);

            this.snakeMgr.grow();
            this.uiManager.addScore();
            // 重新生成蛋，避开蛇身
            this.eggMgr.spawnEgg(this.snakeMgr.getBodyPositions());
        }
        // 视图更新由 update() 每帧平滑插值处理
    }

    /** 游戏结束 */
    private gameOver() {
        this.isPlaying = false;
        console.log('game over, score:', this.uiManager.getScore());
        this.uiManager.showGameOver();
        this.snakeViewCtrl.clearAll();
    }

    /** 键盘输入处理 */
    private onKeyDown(event: EventKeyboard) {
        if (!this.isPlaying) return;

        switch (event.keyCode) {
            case KeyCode.ARROW_UP:
            case KeyCode.KEY_W:
                this.snakeMgr.setDirection(0, 1);
                break;
            case KeyCode.ARROW_DOWN:
            case KeyCode.KEY_S:
                this.snakeMgr.setDirection(0, -1);
                break;
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
                this.snakeMgr.setDirection(-1, 0);
                break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
                this.snakeMgr.setDirection(1, 0);
                break;
        }
    }
}
