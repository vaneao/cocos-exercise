# Hanoi
Game Name: 捕鱼达人

Author: vaneao

Time: 2021.9.29

Reference: https://gitee.com/Raindrips/cocos_creator/tree/master/fish

# 游戏预览
![preview_game_1.png](https://i.loli.net/2021/09/29/KyG3CIz81aBhVgo.png)
![preview_game_2.png](https://i.loli.net/2021/09/29/iN9xXAYy8OzVCEp.png)
![preview_game_3.png](https://i.loli.net/2021/09/29/xRE34UokwtWazC1.png)

# 大致思路（不全）
1、建立游戏场景（背景、炮台）
2、从炮台最左边开始看。首先是“金币剩余量”，这里需要根据炮弹的等级去进行一个减少，
   并在捕捉到鱼后，获得对应的奖励，金币量需要更新。
3、接下来看中间。“-”图标，代表给炮塔降级，需要播放切换炮塔的动画，还有子弹的类型
   也要对应炮塔的等级。“+”和“-”的操作类似，一个是升级，一个是降级。
4、还需要两个东西：“鱼”和“能发射的炮弹”，这两者之间是需要添加一个碰撞事件的。
5、要有鱼的类型，鱼的价值，鱼的名称，这是一条鱼最基本的信息。其次我们还需要让鱼在
   场景中游动起来，这里用到了“贝塞尔曲线”，让鱼的运动路线符合它。
6、炮弹的发射，炮塔也得跟着鼠标或手 touch 的地方旋转。
7、鱼和炮弹都用到了对象池，性能优化。
8、还有就是捕捉到鱼的一个“鱼的死亡效果”还有捕捉到鱼的一个“获得金币的动画效果”。
