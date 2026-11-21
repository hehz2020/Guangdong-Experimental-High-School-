# Minecraft Java 版地图（进行中）

把 3D 校园转换成 Minecraft Java 版（1.21 格式）的存档。比例 1:1：一格 = 1 米，方块坐标的 x、z 就是 3D 版的 x（向东）、
z（向南），高度 h 米对应 y = floor(h) + 64（地面顶在 y 64）。

## 流程

1. `node minecraft/voxelize.mjs <本地网址> <vox.json> x0 x1 z0 z1 y0 y1 [--tile 128]`（`--tile`：大范围切成小块，一次加载，每块一个文件）
   在无头浏览器里加载校园（`?lightdebug=1` 会把场景交给脚本），把盒子范围内每个可见网格的三角面撒点采样，
   每个点沿面的法线往里推 0.1 米，落到 1 米的格子里；每格记下每种材质的面积、平均高度和命中了八个 0.5 米小格中的哪几个。
   走动的人、车、鸟，纯碰撞用的隐形网格不算；只在近处显示的细节（室内、各层房间）先全部打开。
2. `python minecraft/build_world.py <vox.json ...> --out <存档文件夹> --name 名字 --spawn x,z,朝向`（多个文件拼成一个存档）
   每格取面积最大的材质（顶面稍占优，所以铺地压过下面的地皮），按 `blocks.py` 的规则换成方块：
   按材质名分类（玻璃、树叶、水、金属、木、灯、花……），类内取平均颜色最接近的方块；
   再按小格判断形状：只有下半 → 下半砖，只有上半 → 上半砖，下半满、上半一侧 → 楼梯，薄的玻璃 → 玻璃板，
   细的金属 → 铁栏杆；地面及以下一律整块。水从水面往下灌到底；树叶设为不会腐烂；玻璃板和铁栏杆按邻居算好连接。
   写出 `level.dat`（超平坦、创造模式、固定中午、不刷怪）和 `region/*.mca`。
3. `python minecraft/check_world.py <存档文件夹> [x,y,z ...]` 按游戏的读法把存档读回来检查，并打印指定位置的方块。
4. 预览（不进游戏看个大概）：`python minecraft/export_preview.py blocks.npz blocks.bin`，
   `node minecraft/preview.mjs <本地网址> blocks.bin <输出目录> 名字,x,y,z,朝向,俯仰 ...`（纯色方块，没有游戏的贴图和光照）。

需要：Node 和 Playwright（同网站的测试），Python 3.9+、numpy、nbtlib（`pip install numpy nbtlib`）。

## 放进游戏（Java 版 26.x）

Java 版 26.1 起改了存档结构（主世界的区块挪到 `dimensions/minecraft/overworld/region`，`level.dat` 拆成多个文件）。
这里写的 `level.dat` 是 1.21 的格式，26.3 打不开（报 “Unknown data version: 0”）。所以现在的做法是：
在游戏里新建超平坦世界（预设 `minecraft:bedrock,123*minecraft:stone,3*minecraft:dirt,minecraft:grass_block;minecraft:plains`，
地面和地图对齐），退出后把 `region/*.mca` 复制进那个世界的 `dimensions/minecraft/overworld/region`。区块仍是 1.21 格式，
游戏读到时会自己升级。

## 现状

- 第 1 版 demo：校门、水池、林荫道、钟楼一带，约 175 × 125 米，自动转换，没有在游戏里打开过（这里没有游戏）。
- 方块的选择全是判断，不是量测；室内家具、门、门牌和墙上的字还没专门处理。
