import { _decorator, Component, Node, Label, Color, UITransform, UIOpacity, tween, Vec3 } from 'cc';

const { ccclass } = _decorator;

@ccclass('floatingText')
export class floatingText extends Component {

    /**
     * 在指定父节点下创建一个飘字效果
     * @param parent 父节点（应与游戏对象同坐标系，如 eggParent）
     * @param text 显示文字
     * @param localX 本地坐标 X
     * @param localY 本地坐标 Y
     * @param fontRef 参考字体（从已有的 Label 复制字体，确保能渲染）
     */
    public static show(
        parent: Node,
        text: string,
        localX: number,
        localY: number,
        fontRef: Label | null = null,
    ): void {
        const fontSize = 56;
        const color = new Color(255, 215, 0, 255);
        const duration = 1.2;
        const floatDistance = 100;

        // 创建节点
        const node = new Node('floatingText');
        parent.addChild(node);
        node.setPosition(localX, localY, 0);

        // 添加 UITransform
        const uiTransform = node.addComponent(UITransform);
        uiTransform.setContentSize(200, 50);

        // 添加 UIOpacity 用于淡出
        const opacityComp = node.addComponent(UIOpacity);
        opacityComp.opacity = 255;

        // 添加 Label
        const label = node.addComponent(Label);

        // 复用参考 Label 的字体设置，确保能渲染
        if (fontRef) {
            label.font = fontRef.font;
            label.useSystemFont = fontRef.useSystemFont;
        } else {
            label.useSystemFont = true;
        }

        label.string = text;
        label.fontSize = fontSize;
        label.lineHeight = fontSize;
        label.color = color;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.overflow = Label.Overflow.NONE;

        // 设置渲染层级，确保飘字在最上层
        node.setSiblingIndex(parent.children.length - 1);

        // 缓动动画：上飘
        tween(node)
            .by(duration, { position: new Vec3(0, floatDistance, 0) }, { easing: 'sineOut' })
            .start();

        // 缓动动画：淡出后销毁
        tween(opacityComp)
            .to(duration, { opacity: 0 })
            .call(() => {
                node.destroy();
            })
            .start();
    }
}
