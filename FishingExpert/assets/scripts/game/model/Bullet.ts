const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {

    @property(cc.SpriteAtlas)
    spriteAtlas: cc.SpriteAtlas = null;

    // 子弹速度
    @property
    speed: number = 300;

    // 子弹攻击力
    private attack: number = 4;
    // 子弹等级
    bulletLevel: number = 1;

    onLoad() {
        // 监听射击事件
        this.node.on('shot', this.shot, this);
    }

    update(dt) {
        const bx = this.speed * Math.sin(this.node.angle / 180 * Math.PI) * dt;
        const by = this.speed * Math.cos(this.node.angle / 180 * Math.PI) * dt;
        this.node.x -= bx;
        this.node.y += by;

        const rect = this.node.parent.getBoundingBox();
        // 如果子弹还在页面上
        if (!rect.contains(this.node.getPosition())) {
            // cc.Node.dispatchEvent: 分发事件到事件流中
            // cc.Event.EventCustom: 自定义事件
            this.node.dispatchEvent(new cc.Event.EventCustom('despawn-bullet', true));
        }
    }

    onDestroy() {
        this.node.off('shot', this.shot, this);
    }

    // 射击
    shot(weaponNode: cc.Node, level: number) {
        const pos = weaponNode.position;
        this.node.position = pos;
        // cc.Node.angle: number 该节点的旋转角度，正值为逆时针方向
        this.node.angle = weaponNode.angle;
        this.setBullet(level);
    }

    // 根据武器等级设置子弹等级
    setBullet(level: number) {
        this.bulletLevel = level;
        // cc.SpriteAtlas.getSpriteFrame: returns the sprite frame correspond to the given key in sprite atlas.
        this.node.getComponent(cc.Sprite).spriteFrame =
            this.spriteAtlas.getSpriteFrame(`bullet${this.bulletLevel}`);
    }

    onCollisionEnter(other: cc.BoxCollider, self: cc.BoxCollider) {
        if (other.node.group === 'fish') {
            const event = new cc.Event.EventCustom('cast-net', true);
            // 设置用户数据
            event.setUserData(this.node.position);
            this.node.dispatchEvent(event);
            this.node.dispatchEvent(new cc.Event.EventCustom('despawn-bullet', true));
        }
    }

    // 子弹最终伤害 = 子弹初始攻击 * 子弹等级
    getAttackValue(): number {
        return this.attack * this.bulletLevel;
    }
}
