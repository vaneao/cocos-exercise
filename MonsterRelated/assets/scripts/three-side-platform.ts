const { ccclass, property } = cc._decorator;

@ccclass
export default class ThreeSidePlatform extends cc.Component {

    pointVelplatform: cc.Vec2 = null;
    pointVelOther: cc.Vec2 = null;
    relativeVel: cc.Vec2 = null;
    relativePoint: cc.Vec2 = null;
    _pointsCache: Cache = null;

    onLoad() {
        this.pointVelplatform = cc.v2();
        this.pointVelOther = cc.v2();
        this.relativeVel = cc.v2();
        this.relativePoint = cc.v2();
    }

    /**
        !#en
        Collision callback.
        Called when two collider begin to touch.
        !#zh
        碰撞回调。
        如果你的脚本中实现了这个函数，那么它将会在两个碰撞体开始接触时被调用。
        @param contact contact information
        @param selfCollider the collider belong to this rigidbody
        @param otherCollider the collider belong to another rigidbody 
    */
    onBeginContact(contact, selfCollider, otherCollider) {
        const cache = this._pointsCache;

        const otherBody = otherCollider.body;
        const platformBody = selfCollider.body;

        // 获取世界坐标下的碰撞信息
        const worldManifold = contact.getWorldManifold();
        // 获取碰撞点集合
        const points = worldManifold.points;

        const pointVelPlatform = this.pointVelplatform;
        const pointVelOther = this.pointVelOther;
        const relativeVel = this.relativeVel;
        const relativePoint = this.relativePoint;

        let flag = false;
        for (let i = 0, len = points.length; i < len - 1; i++) {
            if (points[i].y !== points[i + 1].y) {
                flag = true;  // 碰撞点的y坐标不相等
                break;
            }
        }

        for (let i = 0, len = points.length; i < len; i++) {
            // 获取刚体上指定点的线性速度
            platformBody.getLinearVelocityFromWorldPoint(points[i], pointVelPlatform);
            otherBody.getLinearVelocityFromWorldPoint(points[i], pointVelOther);
            // 将一个给定的世界坐标系下的向量转换为刚体本地坐标系下的向量
            platformBody.getLocalVector(pointVelOther.subSelf(pointVelPlatform), relativeVel);

            if (relativeVel.y < 0 && !flag) {
                return;
            } else if (otherCollider.body.linearVelocity.x !== 0 && flag) {
                return;
            }
        }

        contact.disabled = true;
    }
}
