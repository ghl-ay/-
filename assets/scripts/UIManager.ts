import { Label, Button, UITransform } from 'cc';

export class UIManager {

    private score: number = 0;
    // 缓存初始位置，游戏结束时恢复
    private originalPos: { x: number; y: number } = null;

    constructor(private scoreLabel: Label, private startbutton: Button) {
        // 记录初始位置
        const pos = this.scoreLabel.node.position;
        this.originalPos = { x: pos.x, y: pos.y };
    }

    /** 隐藏得分标签和开始按钮 */
    hideScoreLabel() {
        this.scoreLabel.node.active = false;
        this.startbutton.node.active = false;
    }

    /** 将分数标签定位到左上角 */
    private positionScoreTopLeft() {
        const node = this.scoreLabel.node;
        const parent = node.getParent();
        if (!parent) return;

        const parentTransform = parent.getComponent(UITransform);
        if (!parentTransform) return;

        const labelTransform = node.getComponent(UITransform);
        if (!labelTransform) return;

        const parentW = parentTransform.contentSize.width;
        const parentH = parentTransform.contentSize.height;
        const labelH = labelTransform.contentSize.height;

        const margin = 20;
        // 左上角: x = -父宽/2 + margin, y = 父高/2 - margin - 标签高/2
        const x = -parentW / 2 + margin + labelTransform.contentSize.width / 2;
        const y = parentH / 2 - margin - labelH / 2;

        node.setPosition(x, y, 0);
    }

    /** 显示得分标签并更新分数 */
    showScore() {
        this.scoreLabel.node.active = true;
        this.scoreLabel.string = '得分: ' + this.score;
        this.positionScoreTopLeft();
    }

    /** 更新分数显示 */
    updateScore(score: number) {
        this.score = score;
        this.scoreLabel.string = '得分: ' + this.score;
    }

    /** 分数+1并刷新 */
    addScore() {
        this.score++;
        this.scoreLabel.string = '得分: ' + this.score;
    }

    /** 获取当前分数 */
    getScore(): number {
        return this.score;
    }

    /** 重置分数 */
    resetScore() {
        this.score = 0;
        this.scoreLabel.string = '得分: 0';
    }

    /** 游戏结束：显示分数和重新开始按钮 */
    showGameOver() {
        this.scoreLabel.node.active = true;
        this.scoreLabel.string = '游戏结束! 得分: ' + this.score;
        // 游戏结束恢复居中显示
        if (this.originalPos) {
            this.scoreLabel.node.setPosition(this.originalPos.x, this.originalPos.y, 0);
        }
        this.startbutton.node.active = true;
    }
}
