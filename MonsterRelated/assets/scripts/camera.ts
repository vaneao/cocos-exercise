const { ccclass, property } = cc._decorator;

@ccclass
export default class Camera extends cc.Component {

    camera: cc.Camera = null;

    @property(cc.Node)
    target: cc.Node = null;

    onLoad() {
        this.camera = this.getComponent(cc.Camera);
    }

    lateUpdate(dt) {
        const targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        const y = this.target.y;
        if (y > 0 && y < this.node.parent.getChildByName('Background').height - this.node.parent.height - 17) {
            this.node.y = y;
        }
    }
}
