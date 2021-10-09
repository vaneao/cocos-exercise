const { ccclass, property } = cc._decorator;

@ccclass
export default class Rope extends cc.Component {

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Player') {
            const player = otherCollider.node.getComponent('player');
            player.enterRope = true;
            player.ropeCenter = selfCollider.offset.x;
        }
        contact.disabled = true;
    }

    onEndContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Player') {
            const player = otherCollider.node.getComponent('player');
            player.enterRope = false;
        }
    }
}
