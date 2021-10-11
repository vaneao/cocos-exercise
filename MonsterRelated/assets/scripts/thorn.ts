const { ccclass, property } = cc._decorator;

@ccclass
export default class Thorn extends cc.Component {

    nodePlayer: cc.Node = null;

    onLoad() {
        this.nodePlayer = this.node.parent.parent.getChildByName('Player');
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        const player = this.nodePlayer.getComponent('player');
        player.hurt = true;
        if (selfCollider.offset.x > otherCollider.node.position.x) {
            player.flag = true; // 往左弹
        } else {
            player.flag = false; // 往右弹
        }
        contact.disabled = true;
    }
}
