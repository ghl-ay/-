import { _decorator, Node, Prefab, UITransform, instantiate } from 'cc';
import { GridPos, snakeManager } from './snakeManager';
const { ccclass } = _decorator;

@ccclass('eggManager')
export class eggManager {
    private canvasTransform: UITransform;
    private canvasWidth: number = 0;
    private canvasHeight: number = 0;
    // 当前蛋的节点
    private currentEgg: Node = null;
    // 当前蛋的网格位置
    private currentPos: GridPos = { col: 0, row: 0 };

    constructor(private eggPrefab: Prefab, private eggParent: Node) {
        this.canvasTransform = this.eggParent.getComponent(UITransform)
            ?? this.eggParent.getParent()?.getComponent(UITransform);
        if (this.canvasTransform) {
            this.canvasWidth = this.canvasTransform.contentSize.width;
            this.canvasHeight = this.canvasTransform.contentSize.height;
        }
        console.log('canvasSize', this.canvasWidth, this.canvasHeight);
    }

    /** 生成一个蛋（如果已有蛋先移除），避开蛇身 */
    public spawnEgg(snakeBody?: GridPos[]): void {
        this.removeEgg();

        const cols = 10;
        const rows = 18;
        let col: number, row: number;
        let attempts = 0;

        // 随机选位置，避开蛇身
        do {
            col = Math.floor(Math.random() * cols);
            row = Math.floor(Math.random() * rows);
            attempts++;
        } while (snakeBody && snakeBody.some(b => b.col === col && b.row === row) && attempts < 200);

        this.currentPos = { col, row };
        const worldPos = snakeManager.gridToWorld(col, row);

        this.currentEgg = instantiate(this.eggPrefab);
        this.currentEgg.setPosition(worldPos.x, worldPos.y, 0);
        this.eggParent.addChild(this.currentEgg);
    }

    /** 移除当前蛋 */
    public removeEgg(): void {
        if (this.currentEgg && this.currentEgg.isValid) {
            this.currentEgg.destroy();
            this.currentEgg = null;
        }
    }

    /** 获取当前蛋的网格位置 */
    public getEggPosition(): GridPos {
        return { ...this.currentPos };
    }

    /** 检测蛇头是否吃到蛋 */
    public isEaten(headPos: GridPos): boolean {
        return this.currentPos.col === headPos.col && this.currentPos.row === headPos.row;
    }
}
