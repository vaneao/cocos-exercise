const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property
    maxSpeed: number = 110;

    @property
    jumps: number = 1;  // 单次跳跃次数

    @property
    acceleration: number = 1500;

    @property
    jumpSpeed: number = 520;

    @property
    drag: number = 600;

    @property(cc.AudioClip)
    jumpAudio: cc.AudioClip = null;

    body: cc.RigidBody = null;
    _up: boolean = false;
    _down: boolean = false;
    _pause: boolean = false;
    _alt: boolean = false;
    _left: boolean = false;
    _right: boolean = false;
    _jumps: number = 0;
    _altPressed: boolean = false;
    game: cc.Component = null;
    flag: boolean = false;
    outOfCtrl: boolean = false;
    prey: number = 0;
    gravity: number = 0;  // 缩放应用在此刚体上的重力值
    hurt: boolean = false;  // 是否收到伤害
    enterRope: boolean = false;  // 当前位置是否能进入绳索
    onRope: boolean = false;  // 是否在绳索上
    ropeCenter: number = 0;

    onLoad() {
        this.register();
        this.init();
    }

    onDestroy() {
        this.unregister();
    }

    update(dt) {
        const speed = this.body.linearVelocity;
        const position = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);

        // 判断游戏是否结束
        if (position.y < 0) {
            cc.director.loadScene("GameOver");
            this.enabled = false;  // 终止脚本
        }

        // 是否碰到陷阱
        if (this.hurt && !this.outOfCtrl) {  // 弹一下
            this.flag ? speed.x = -200 : speed.x = 200;
            speed.y = 300;
            this.outOfCtrl = true;  // 被弹的过程中失去了控制
            this.hurt = false;
            this.enterRope = false;  // 如果是碰到了齿轮陷阱，应该将玩家从绳索上移除
        }

        // 是否进入绳索范围，当前是否能攀爬绳索
        this.isEnterRope(speed);

        // 移动
        this.canMove(speed, dt);

        // 连续两帧y速度为0即重置跳跃
        if (this.prey === 0 && speed.y === 0) {
            this.jumps = 1;
            this.outOfCtrl = false;
        }

        // Scene border 防止跑出地图边界
        const l = -this.node.parent.width / 2 + this.node.width * this.node.scale / 2;
        const r = this.node.parent.width / 2 + this.node.width * this.node.scale / 2;
        if (this.node.x < l) {
            speed.x = 0;
            this.node.x = l;
        } else if (this.node.x > r) {
            speed.x = 0;
            this.node.x = r;
        }

        // Implement
        this.body.linearVelocity = speed;
        this.prey = speed.y;
    }

    register() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    unregister() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    }

    init() {
        this.body = this.getComponent(cc.RigidBody);
        this._jumps = this.jumps;
        this.game = this.node.parent.getComponent('game');
        this.gravity = this.body.gravityScale;
    }

    onKeyDown(e) {
        const key = cc.macro.KEY;
        switch (e.keyCode) {
            case key.a:
            case key.left:
                this._left = true;
                break;
            case key.d:
            case key.right:
                this._right = true;
                break;
            case key.alt:
                if (!this._altPressed && this.body.linearVelocity.y === 0) {
                    this._alt = true;
                }
                this._altPressed = true;
                break;
            case key.w:
            case key.up:
                this._up = true;
                break;
            case key.s:
            case key.down:
                this._down = true;
                break;
            case key.z:
                this._pause = true;
                break;
        }
    }

    onKeyUp(event) {
        const key = cc.macro.KEY;
        switch (event.keyCode) {
            case key.a:
            case key.left:
                this._left = false;
                break;
            case key.d:
            case key.right:
                this._right = false;
                break;
            case key.alt:
                this._altPressed = false;
                this._alt = false;
                break;
            case key.w:
            case key.up:
                this._up = false;
                break;
            case key.s:
            case key.down:
                this._down = false;
                break;
            case key.z:
                this._pause = false;
                break;
        }
    }

    // 是否可以攀爬绳索
    isEnterRope(speed: cc.Vec2) {
        if (this.enterRope) {
            // 如果当前没有在绳索上，且可以向上和向下移动，且玩家没有失去控制
            if (!this.onRope && (this._up || this._down) && !this.outOfCtrl) {
                if (this._down) {
                    this.node.y -= this.node.height * this.node.scale;
                }
                this.onRope = true;
                this.body.gravityScale = 0;
                this.node.x = this.ropeCenter;
                speed.y = 0;
            }

            // 如果已经在绳索上了
            if (this.onRope) {
                speed.x = 0;
                this._up
                    ? speed.y = 70
                    : this._down ? speed.y = -70 : speed.y = 0;
                if (this._left && this._altPressed) {
                    this.body.gravityScale = this.gravity;
                    speed.x = -110;
                    speed.y = 520;
                    this.onRope = false;
                } else if (this._right && this._altPressed) {
                    this.body.gravityScale = this.gravity;
                    speed.x = 110;
                    speed.y = 520;
                    this.onRope = false;
                }
            } else {
                this.body.gravityScale = this.gravity;
            }
        } else {
            this.body.gravityScale = this.gravity;
            this.onRope = false;
        }
    }

    // 是否可以移动
    canMove(speed: cc.Vec2, dt) {
        if (!this.outOfCtrl) {  // 如果玩家没有处于失去控制的状态
            // 向左移动
            if (this._left && !this.onRope) {
                if (speed.x > -this.maxSpeed) {
                    speed.x -= this.acceleration * dt;
                    if (speed.x <= -this.maxSpeed) {
                        speed.x = -this.maxSpeed;
                    }
                }
            }
            // 向右移动
            else if (this._right && !this.onRope) {
                if (speed.x < this.maxSpeed) {
                    speed.x += this.acceleration * dt;
                    if (speed.x >= this.maxSpeed) {
                        speed.x = this.maxSpeed;
                    }
                }
            }
            // Release the key
            else {
                if (speed.x !== 0) {
                    const d = this.drag * dt;
                    if (Math.abs(speed.x) <= d) {
                        speed.x = 0;
                    } else {
                        speed.x -= speed.x > 0 ? d : -d;
                    }
                }
            }

            // Jump
            if (this.jumps > 0 && this._alt && !this.onRope) {
                cc.audioEngine.play(this.jumpAudio, false, 1);
                this.jumps--;
                speed.y = this.jumpSpeed;
                this._alt = false;
            }
        }
    }
}
