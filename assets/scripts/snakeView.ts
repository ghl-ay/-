import { Node, Prefab, instantiate, NodePool, Vec3 } from 'cc';
import { snakeManager, GridPos } from './snakeManager';

const _tempPos = new Vec3();

export class snakeView {

    private snakeHeadPrefab: Prefab;
    private snakeBodyPrefab: Prefab;
    private snakeParent: Node;

    private headNode: Node = null;
    private bodyNodes: Node[] = [];
    private bodyPool: NodePool = null;

    constructor(snakeHeadPrefab: Prefab, snakeBodyPrefab: Prefab, snakeParent: Node) {
        this.snakeHeadPrefab = snakeHeadPrefab;
        this.snakeBodyPrefab = snakeBodyPrefab;
        this.snakeParent = snakeParent;
        this.bodyPool = new NodePool('snakeBody');
    }

    /** 初始化/重置视图，创建蛇头 */
    public init(): void {
        this.clearAll();
        this.headNode = instantiate(this.snakeHeadPrefab);
        this.snakeParent.addChild(this.headNode);
        this.bodyNodes = [];
    }

    /** 根据蛇管理器的数据更新视图（直接跳到目标位置） */
    public updateView(manager: snakeManager): void {
        this.updateViewSmooth(manager, 1.0);
    }

    /** 平滑插值更新视图，t 为 0~1 的插值因子 */
    public updateViewSmooth(manager: snakeManager, t: number): void {
        const positions = manager.getBodyPositions();
        const prevPositions = manager.getPrevBodyPositions();
        // 限制 t 在 [0, 1]
        const lerpT = Math.min(1, Math.max(0, t));

        // 更新蛇头
        if (this.headNode && positions.length > 0) {
            const curWorld = snakeManager.gridToWorld(positions[0].col, positions[0].row);
            if (prevPositions.length > 0) {
                const prevWorld = snakeManager.gridToWorld(prevPositions[0].col, prevPositions[0].row);
                _tempPos.set(
                    prevWorld.x + (curWorld.x - prevWorld.x) * lerpT,
                    prevWorld.y + (curWorld.y - prevWorld.y) * lerpT,
                    0
                );
            } else {
                _tempPos.set(curWorld.x, curWorld.y, 0);
            }
            this.headNode.setPosition(_tempPos);
        }

        // 更新蛇身
        const bodyPositions = positions.slice(1);
        const prevBodyPositions = prevPositions.slice(1);

        // 补充不足的节点
        while (this.bodyNodes.length < bodyPositions.length) {
            let node: Node;
            if (this.bodyPool.size() > 0) {
                node = this.bodyPool.get()!;
            } else {
                node = instantiate(this.snakeBodyPrefab);
            }
            this.snakeParent.addChild(node);
            this.bodyNodes.push(node);
        }
        // 回收多余的节点
        while (this.bodyNodes.length > bodyPositions.length) {
            const node = this.bodyNodes.pop()!;
            this.bodyPool.put(node);
        }
        // 更新每个身体节点的位置（插值）
        for (let i = 0; i < bodyPositions.length; i++) {
            const curPos = snakeManager.gridToWorld(bodyPositions[i].col, bodyPositions[i].row);
            if (i < prevBodyPositions.length) {
                const prevPos = snakeManager.gridToWorld(prevBodyPositions[i].col, prevBodyPositions[i].row);
                _tempPos.set(
                    prevPos.x + (curPos.x - prevPos.x) * lerpT,
                    prevPos.y + (curPos.y - prevPos.y) * lerpT,
                    0
                );
            } else {
                _tempPos.set(curPos.x, curPos.y, 0);
            }
            this.bodyNodes[i].setPosition(_tempPos);
        }
    }

    /** 清除所有蛇的节点 */
    public clearAll(): void {
        if (this.headNode) {
            this.headNode.destroy();
            this.headNode = null;
        }
        for (const node of this.bodyNodes) {
            if (node.isValid) {
                this.bodyPool.put(node);
            }
        }
        this.bodyNodes = [];
    }

    /** 销毁时清理节点池 */
    public destroy(): void {
        this.clearAll();
        this.bodyPool.clear();
    }
}
