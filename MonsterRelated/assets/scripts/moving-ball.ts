const { ccclass, property } = cc._decorator;

@ccclass
export default class MovingBall extends cc.Component {

    onLoad() {
        // 创建 easeInOut 缓动对象，慢到快，然后慢
        const moveTo = cc.moveBy(2, cc.v2(200, 0)).easing(cc.easeInOut(3.0));
        const moveBack = cc.moveBy(2, cc.v2(-200, 0)).easing(cc.easeCubicActionInOut());
        const moveAction = cc.repeatForever(cc.sequence(moveTo, moveBack));
        this.node.runAction(moveAction);
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Player') {
            const player = otherCollider.node.getComponent('player');
            player.hurt = true;
            if (selfCollider.node.x > otherCollider.node.x) {
                player.flag = true;  // 往左弹
            } else {
                player.flag = false;  // 往右弹
            }
        }

        contact.disabled = true;
    }
}
