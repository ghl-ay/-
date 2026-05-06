const GRID_SIZE = 75;
const COLS = 10;
const ROWS = 18;

export interface GridPos {
    col: number;
    row: number;
}

export class snakeManager {

    // 蛇身数组，索引0为蛇头
    private body: GridPos[] = [];
    // 上一次 tick 的蛇身位置（用于平滑插值）
    private prevBody: GridPos[] = [];
    // 当前方向
    private direction: GridPos = { col: 1, row: 0 }; // 默认向右
    // 下一帧方向（防止一帧内反向）
    private nextDirection: GridPos = { col: 1, row: 0 };
    // 是否需要增长（吃到蛋后下一帧不去尾）
    private shouldGrow: boolean = false;

    /** 初始化蛇，蛇头在中央，初始3节 */
    public init(): void {
        this.body = [];
        this.shouldGrow = false;
        this.direction = { col: 1, row: 0 };
        this.nextDirection = { col: 1, row: 0 };

        const startCol = Math.floor(COLS / 2);
        const startRow = Math.floor(ROWS / 2);
        // 蛇头在中央，蛇身向左延伸
        for (let i = 0; i < 3; i++) {
            this.body.push({ col: startCol - i, row: startRow });
        }
        // 初始时 prevBody 与 body 一致
        this.prevBody = this.body.map(p => ({ ...p }));
    }

    /** 设置方向，防止反向移动 */
    public setDirection(dx: number, dy: number): void {
        // 不允许反向（当前方向与新方向相反则忽略）
        if (this.direction.col + dx === 0 && this.direction.row + dy === 0) {
            return;
        }
        this.nextDirection = { col: dx, row: dy };
    }

    /** 蛇移动一格，返回是否成功（未撞墙/撞自身） */
    public move(): boolean {
        // 保存移动前位置
        this.prevBody = this.body.map(p => ({ ...p }));

        this.direction = { ...this.nextDirection };

        const head = this.body[0];
        const newHead: GridPos = {
            col: head.col + this.direction.col,
            row: head.row + this.direction.row,
        };

        // 撞墙检测
        if (newHead.col < 0 || newHead.col >= COLS || newHead.row < 0 || newHead.row >= ROWS) {
            return false;
        }

        // 撞自身检测（不含最后一节，因为如果没增长，尾巴会移走）
        const checkLength = this.shouldGrow ? this.body.length : this.body.length - 1;
        for (let i = 0; i < checkLength; i++) {
            if (this.body[i].col === newHead.col && this.body[i].row === newHead.row) {
                return false;
            }
        }

        // 插入新头
        this.body.unshift(newHead);

        // 是否增长
        if (this.shouldGrow) {
            this.shouldGrow = false;
            // 增长时 prevBody 也需要补一节，用尾巴位置
            this.prevBody.push({ ...this.prevBody[this.prevBody.length - 1] });
        } else {
            this.body.pop(); // 去尾
        }

        return true;
    }

    /** 标记下一帧增长 */
    public grow(): void {
        this.shouldGrow = true;
    }

    /** 检测蛇头是否在指定格子位置 */
    public isHeadAt(pos: GridPos): boolean {
        return this.body[0].col === pos.col && this.body[0].row === pos.row;
    }

    /** 获取蛇身所有格子位置 */
    public getBodyPositions(): GridPos[] {
        return [...this.body];
    }

    /** 获取蛇头位置 */
    public getHeadPosition(): GridPos {
        return { ...this.body[0] };
    }

    /** 获取蛇身长度 */
    public getLength(): number {
        return this.body.length;
    }

    /** 网格坐标转世界坐标（与 eggManager 保持一致） */
    public static gridToWorld(col: number, row: number): { x: number; y: number } {
        const gridWidth = COLS * GRID_SIZE;
        const gridHeight = ROWS * GRID_SIZE;
        const x = -gridWidth / 2 + col * GRID_SIZE + GRID_SIZE / 2;
        const y = -gridHeight / 2 + row * 74.11 + 37.055;
        return { x, y };
    }

    /** 检查某个格子是否被蛇身占据 */
    public isBodyAt(pos: GridPos): boolean {
        return this.body.some(b => b.col === pos.col && b.row === pos.row);
    }

    /** 获取上一 tick 的蛇身位置（用于平滑插值） */
    public getPrevBodyPositions(): GridPos[] {
        return [...this.prevBody];
    }
}
