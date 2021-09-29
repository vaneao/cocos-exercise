const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    start() {
        cc.debug.setDisplayStats(true);
        let collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;
    }
}
