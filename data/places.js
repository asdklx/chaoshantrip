/* Coordinates are WGS84 from the linked OpenStreetMap records where a source
 * is shown. Null means an exact point has not been verified; use the named map
 * search. routeCoords are road-access references used only for the cached
 * driving geometry and are not presented as attraction or hotel coordinates.
 * mapCoords are visual-only area anchors for the interactive overview; they
 * must never be used as navigation coordinates.
 * Durations are suggested visiting time, not verified opening hours.
 */
window.TRIP_PLACES = {
  home: {
    id: 'home', name: '普宁御景城（家）', short: '御景城', area: 'puning', category: '住宿', art: '家',
    coords: [116.1589961, 23.3161859], mapLabel: '普宁广场·御景城附近区域锚点', query: '普宁御景城', duration: '按需休息',
    description: '家在普宁御景城，作为接站、休息、取车和返程的片区锚点；地图只显示附近公共区域，不标注住宅门牌。',
    access: '地图坐标是普宁广场公共区域参考；实际回家、接送和停车位置请按自己的住址确认。',
    source: 'https://www.openstreetmap.org/way/703042212', sourceDate: '2026-09-29 核查', extra: false
  },
  'puning-station': {
    id: 'puning-station', name: '普宁站', short: '普宁站', area: 'puning', category: '交通', art: '站',
    coords: [116.1946410, 23.2694032], mapLabel: '普宁站', query: '广东省揭阳市普宁市普宁站', duration: '建议提前约 60 分钟到站',
    description: '去程 10 月 1 日 02:59 抵达；返程 10 月 3 日 21:08 发车。出站接车点与进站落客点分别确认。',
    access: '车次与时刻来自已购车票；检票口、停检时间及接送区域以铁路与现场信息为准。',
    source: 'https://www.openstreetmap.org/node/10555760577', sourceDate: '2026-09-29 核查', extra: false
  },
  park: {
    id: 'park', name: '流沙人民公园', short: '人民公园', area: 'puning', category: '公园', art: '园',
    coords: [116.1662457, 23.2977887], mapLabel: '流沙人民公园', query: '广东省揭阳市普宁市流沙人民公园', duration: '45–90 分钟',
    description: '10 月 1 日下午的轻松选项：在市区走走、树下歇脚，之后回家取外宿用品，再前往洪阳；百二丘田安排在 10 月 3 日早上。',
    access: '可检索的市区公园；国庆开放区域、临时活动与管理安排按现场信息确认。',
    source: 'https://www.openstreetmap.org/way/135854567', sourceDate: '2026-09-29 核查', extra: true
  },
  mountain: {
    id: 'mountain', name: '百二丘田', short: '百二丘田', area: 'puning', category: '山野', art: '山',
    coords: [116.17086, 23.26055], mapLabel: '灰寨村·山线位置参考', query: '广东省揭阳市普宁市大南山街道百二丘田藏莲寺', duration: '短线步行 60–90 分钟',
    description: '位于大南山街道灰寨村后山，可看山林、走登山步道。地图标记是灰寨村位置参考，并非景区入口或停车场。',
    access: '官方介绍有步道、游客中心与停车设施；当前入口、山路开放与国庆管理待核实。只走现场开放短线，雨后路滑或没睡好就留在家里休息。',
    source: 'http://www.puning.gov.cn/zjpn/lytd/lyjd/content/post_472510.html', sourceDate: '2020-08-12', extra: true
  },
  'mountain-parking': {
    id: 'mountain-parking', name: '百二丘田停车场（导航点）', short: '百二丘田停车场', area: 'puning', category: '停车', art: '停',
    // OSM way 1314488771 is a mapped surface parking area beside 藏莲路;
    // this is the driving destination, while the hiking point above remains
    // a separate visual reference.
    coords: [116.16531, 23.26413], mapLabel: '百二丘田停车场·藏莲路侧', query: '广东省揭阳市普宁市百二丘田停车场 藏莲路', duration: '停车、整理装备',
    description: '山线驾车只导航到藏莲路侧停车场；到达后按现场指引确认是否能停车、步道入口和当天开放区域，再决定是否步行。',
    access: '坐标来自 OpenStreetMap parking way 1314488771（仅作停车导航参考）；国庆交通管制、停车容量和入口以现场为准。',
    source: 'https://www.openstreetmap.org/way/1314488771', sourceDate: '2026-09-30 核查', extra: false
  },
  deanli: {
    id: 'deanli', name: '德安里', short: '德安里', area: 'north', category: '古厝', art: '厝',
    coords: [116.2115198, 23.4366566], mapLabel: '德安里古民居群', query: '广东省揭阳市普宁市洪阳镇德安里', duration: '1–1.5 小时',
    description: '洪阳古镇的潮汕府第式古民居群，适合慢看门楼、屋脊与街巷；和洪阳晚饭、住宿安排在同一片区。',
    access: '2026 年 9 月官方仍提到广场改造收尾；可参观区域、院落门票与国庆开放待确认，局部围挡以现场为准。',
    source: 'http://www.puning.gov.cn/xwzx/pnxw/content/post_1047610.html', sourceDate: '2026-09-16', extra: true
  },
  hongyang: {
    id: 'hongyang', name: '洪阳古镇街巷', short: '洪阳古镇', area: 'north', category: '街区', art: '巷',
    coords: null, mapCoords: [116.2115198, 23.4366566], mapAccuracy: 'area', mapLabel: '洪阳古镇·德安里同片区', query: '广东省揭阳市普宁市洪阳镇普宁学宫', duration: '午餐及短逛 1–1.25 小时',
    description: '在德安里所在的洪阳片区吃粿汁、无米粿、蚝烙等，再择近处街巷走走；普宁学宫、文昌阁可按体力择一外观。',
    access: '官方推荐古迹与洪阳小吃。镇区街巷和各古迹的参访安排分别确认，不预设所有建筑均可进入。',
    source: 'http://www.puning.gov.cn/zjpn/lytd/lyjd/content/post_867097.html', sourceDate: '2024-08-19', extra: true
  },
  nanxi: {
    id: 'nanxi', name: '南溪水乡', short: '南溪水乡', area: 'north', category: '水乡', art: '水',
    coords: null, routeCoords: [116.215087, 23.431082], mapCoords: [116.215087, 23.431082], mapAccuracy: 'road', mapLabel: '南溪水乡大港码头·道路接入参考', query: '广东省揭阳市普宁市南溪镇南溪水乡大港码头', duration: '岸边短逛 45–60 分钟',
    description: '在普宁北部看河道、村落和水岸生活。地图点采用大港码头附近已标注道路接入参考，具体码头、停车与步行入口仍需到高德核对。',
    access: '2026 官方证实有游船码头、临水步道和游客中心；国庆开航、票价、班次、停车及具体入口未核实。先确认再去，乘船不列为必达项目。',
    source: 'http://www.puning.gov.cn/xwzx/pnxw/content/post_1018899.html', sourceDate: '2026-04-29', extra: true
  },
  nanyan: {
    id: 'nanyan', name: '南岩古寺', short: '南岩古寺', area: 'north', category: '古寺', art: '寺',
    coords: null, routeCoords: [116.240535, 23.399583], mapCoords: [116.240535, 23.399583], mapAccuracy: 'road', mapLabel: '南岩古寺·最近道路参考', query: '广东省揭阳市普宁市南溪镇登峰村南岩古寺', duration: '45–60 分钟',
    description: '位于南溪镇登峰村飞凤山岭；地图点是 OSM 标注的最近道路参考，不等于寺院入口。适合对寺院建筑感兴趣时替代水乡短停，不用与南溪所有选项叠加。',
    access: '官方发布了旅游位置介绍；当前参访入口、开放时间、停车和国庆安排待确认，尊重现场参访秩序。',
    source: 'http://www.puning.gov.cn/zjpn/lytd/lylx/content/post_917809.html', sourceDate: '2025-02-03', extra: true
  },
  lianshan: {
    id: 'lianshan', name: '普宁莲花山公园', short: '莲花山', area: 'puning', category: '公园', art: '山',
    coords: null, mapLabel: '普宁莲花山公园·入口待定位', query: '广东省揭阳市普宁市莲花山公园', duration: '45–90 分钟',
    description: '普宁市区的郊野公园，位于普宁大道与城南大道之间一带；想看绿意又不想走较长山线时可选。',
    access: '官方有公园位置及景观介绍；国庆实际入口、开放区域和停车条件请在导航与现场复核。',
    source: 'http://www.puning.gov.cn/zjpn/lytd/lyjd/content/post_671094.html', sourceDate: '2022-05-06', extra: true
  },
  xintan: {
    id: 'xintan', name: '新坛生态园', short: '新坛生态园', area: 'puning', category: '公园', art: '园',
    coords: null, mapLabel: '新坛生态园·入口待定位', query: '广东省揭阳市普宁市流沙东街道新坛生态园', duration: '45–60 分钟',
    description: '流沙东街道新坛村的生态园，适合作为首日的轻松散步备选；和人民公园、莲花山选一个即可。',
    access: '普宁市政府旅游栏目已有介绍；当前接待时间、入园与停车安排未核实，不预设村内英歌表演。',
    source: 'http://www.puning.gov.cn/zjpn/lytd/lyjd/content/post_791559.html', sourceDate: '2023-09-01', extra: true
  },
  'laohe-changfen': {
    id: 'laohe-changfen', name: '老何肠粉（龙华里店）', short: '老何肠粉', area: 'puning', category: '餐饮', art: '粉',
    coords: null, mapCoords: [116.158, 23.315], mapAccuracy: 'address', mapLabel: '老何肠粉·龙华里78栋', query: '普宁市龙华里78栋 老何肠粉', address: '普宁市龙华里78栋', duration: '早餐／快餐 30–60 分钟',
    rating: '3.3', reviews: '33 条', price: '约 ¥15／人', cuisine: '快餐简餐', meal: '早餐、早午餐',
    description: '用户高德收藏的肠粉店，适合 10 月 1 日补觉后不想跑远时作为早餐或简餐备选。',
    access: '评分、人均和分店地址来自用户收藏截图；出发前点高德核对营业时间、具体门店和导航路线。',
    source: 'https://www.dianping.com/shop/H7gxWFRD1FN15xRM', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  'zhanxinglong-pork': {
    id: 'zhanxinglong-pork', name: '展兴隆深夜鲜猪肉', short: '展兴隆鲜猪肉', area: 'puning', category: '餐饮', art: '鲜',
    coords: null, mapCoords: [116.165, 23.309], mapAccuracy: 'address', mapLabel: '展兴隆深夜鲜猪肉·长春路', query: '普宁市长春路 展兴隆深夜鲜猪肉', address: '普宁市长春路', duration: '夜宵 45–90 分钟',
    rating: '4.3', reviews: '190 条', price: '约 ¥31／人', cuisine: '鲜猪肉、夜宵', meal: '夜宵',
    description: '用户收藏的深夜鲜猪肉店，适合 10 月 1 日德安里周边晚饭后，或回御景城当晚的夜宵备选；不为它专门绕路。',
    access: '评分、人均和门店位置来自用户收藏截图；国庆营业、排队和停车请以高德当天信息为准。',
    source: 'https://www.dianping.com/shop/G77SwoepoucGOSdY', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  'wangji-rice': {
    id: 'wangji-rice', name: '王记饭店（流沙大道西店）', short: '王记饭店', area: 'puning', category: '餐饮', art: '饭',
    coords: null, mapCoords: [116.147, 23.304], mapAccuracy: 'address', mapLabel: '王记饭店·流沙大道西华侨医院斜对面', query: '普宁市流沙大道西华侨医院斜对面龙菀新村16栋 王记饭店', address: '流沙大道西华侨医院斜对面龙菀新村16栋', duration: '正餐 45–90 分钟',
    rating: '4.4', reviews: '390 条', price: '约 ¥37／人', cuisine: '潮汕菜', meal: '午餐、晚餐',
    description: '用户收藏的潮汕菜饭店，位置描述为流沙大道西店；可作为 10 月 1 日普宁市区午饭或返程前一顿正餐。',
    access: '评分、人均和分店信息来自用户收藏截图；导航前核对是否为流沙大道西店，避免同名店。',
    source: 'https://www.dianping.com/shop/ka5fjnSnCBJIjJ6r', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  'ting-siji-coconut-chicken': {
    id: 'ting-siji-coconut-chicken', name: '厅四季椰子鸡（普宁翔悦时代店）', short: '厅四季椰子鸡', area: 'puning', category: '餐饮', art: '椰',
    coords: null, mapCoords: [116.174, 23.326], mapAccuracy: 'address', mapLabel: '厅四季椰子鸡·万泰新天地商场3楼', query: '普宁市万泰新天地商场3楼 厅四季椰子鸡', address: '普宁市万泰新天地商场3楼', duration: '正餐 75–120 分钟',
    rating: '4.2', reviews: '2756 条', price: '约 ¥60／人', cuisine: '椰子鸡火锅', meal: '晚餐、多人聚餐',
    description: '用户收藏的椰子鸡火锅店，有大桌和可预订标记，适合四人聚餐；国庆建议先看高德排队和订座信息。',
    access: '评分、人均和门店信息来自用户收藏截图；以高德当天营业、排队、停车和预订状态为准。',
    source: 'https://www.dianping.com/shop/k46cjAZXOnQhHthA', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  'chaoji-houmi-zhou': {
    id: 'chaoji-houmi-zhou', name: '潮记厚弥粥（十年老店）', short: '潮记厚弥粥', area: 'puning', category: '餐饮', art: '粥',
    coords: null, mapCoords: [116.166, 23.310], mapAccuracy: 'address', mapLabel: '潮记厚弥粥·流沙大道西龙苑新村安全小区底商', query: '普宁市流沙大道西龙苑新村安全小区底商 潮记厚弥粥', address: '流沙大道西龙苑新村安全小区底商', duration: '早餐／夜宵 30–60 分钟',
    rating: '3.9', reviews: '12 条', price: '约 ¥26／人', cuisine: '小吃快餐', meal: '早餐、夜宵',
    description: '用户收藏的老店，截图标注在兰花广场附近；适合早饭、夜宵或不想吃火锅时的轻量选择。',
    access: '评分、人均和片区来自用户收藏截图；具体入口、营业时间和停车请点高德核对。',
    source: 'https://www.dianping.com/shop/H3ethS90iy6g7XwG', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  'laozhou-changfen': {
    id: 'laozhou-changfen', name: '老周肠粉', short: '老周肠粉', area: 'puning', category: '餐饮', art: '肠',
    coords: null, mapCoords: [116.155, 23.308], mapAccuracy: 'address', mapLabel: '老周肠粉·新光南路与德才街交叉口北行70米路东', query: '普宁市新光南路与德才街交叉口北行70米路东 老周肠粉', address: '新光南路与德才街交叉口北行70米路东', duration: '早餐／快餐 30–60 分钟',
    rating: '4.0', reviews: '146 条', price: '约 ¥23／人', cuisine: '小吃面食', meal: '早餐、早午餐',
    description: '用户收藏的肠粉店，适合 10 月 1 日午休后或 10 月 3 日山线取消时在御景城附近找早餐时比较。',
    access: '评分、人均和门店地址来自用户收藏截图；高德搜索可能出现同名结果，请核对普宁市区门店。',
    source: 'https://www.dianping.com/shop/H96Gd1z7jzxUm2f5', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  'nanhua-guozhi': {
    id: 'nanhua-guozhi', name: '南华粿汁', short: '南华粿汁', area: 'puning', category: '餐饮', art: '粿',
    coords: null, mapCoords: [116.154, 23.306], mapAccuracy: 'address', mapLabel: '南华粿汁·金都家具对面', query: '普宁市金都家具对面 南华粿汁', address: '金都家具对面', duration: '早餐／简餐 30–60 分钟',
    rating: '4.0', reviews: '34 条', price: '约 ¥24／人', cuisine: '小吃快餐', meal: '早餐、午餐',
    description: '用户收藏的粿汁店，适合想吃潮汕本地小吃时替代固定餐馆；可和肠粉、粥店按距离二选一。',
    access: '评分、人均和门店位置来自用户收藏截图；出发前用高德确认具体店址、营业时间和停车。',
    source: 'https://www.dianping.com/shop/laLKrJxyDol6ljPM', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  'fuhecheng-beef-hotpot': {
    id: 'fuhecheng-beef-hotpot', name: '福合埕牛肉火锅（流沙总店）', short: '福合埕牛肉火锅', area: 'puning', category: '餐饮', art: '牛',
    coords: null, mapCoords: [116.171, 23.302], mapAccuracy: 'address', mapLabel: '福合埕牛肉火锅·文竹北路仁志昌宾馆楼下', query: '普宁市流沙东街道文竹北路仁志昌宾馆楼下 福合埕牛肉火锅', address: '流沙东街道文竹北路仁志昌宾馆楼下（第一实验小学斜对面）', duration: '多人正餐 75–120 分钟',
    rating: '4.3', reviews: '1358 条', price: '约 ¥74／人', cuisine: '潮汕牛肉火锅', meal: '晚餐、多人聚餐',
    description: '用户收藏的流沙总店，适合四人安排一顿牛肉火锅；国庆时段建议提前确认等位和停车。',
    access: '评分、人均和门店信息来自用户收藏截图；以高德当天营业、排队、停车和分店信息为准。',
    source: 'https://www.dianping.com/shop/k55nXLnoiBtqiz9p', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  'chenmin-beef': {
    id: 'chenmin-beef', name: '陈民牛肉店', short: '陈民牛肉店', area: 'puning', category: '餐饮', art: '牛',
    coords: null, mapCoords: [116.167, 23.309], mapAccuracy: 'address', mapLabel: '陈民牛肉店·流沙大道南平里127栋', query: '普宁市流沙大道南平里127栋 陈民牛肉店', address: '流沙大道南平里127栋', duration: '快餐 30–60 分钟',
    rating: '3.7', reviews: '9 条', price: '约 ¥40／人', cuisine: '快餐简餐', meal: '午餐、晚餐',
    description: '用户收藏的牛肉店，截图标注兰花广场附近；评论量较少，适合顺路尝试，不建议为它专门绕行。',
    access: '评分、人均和片区来自用户收藏截图；导航前核对实际门店、营业状态和停车条件。',
    source: 'https://www.dianping.com/shop/k3SCqABAVu8YGJ9r', sourceDate: '大众点评收藏页面 2026-09-30', extra: true, collection: true
  },
  hotel: {
    id: 'hotel', name: '普宁华庭优品客房', short: '华庭优品客房', area: 'north', category: '住宿', art: '宿',
    coords: null, routeCoords: [116.211882, 23.433319], mapCoords: [116.2115198, 23.4366566], mapAccuracy: 'address', mapLabel: '普宁华庭优品客房·后山村片区', query: '普宁华庭优品客房 普宁市洪阳镇洪阳大道后山村洪马路西270号', address: '普宁市洪阳镇洪阳大道后山村洪马路西270号', duration: '10 月 1 日住 1 晚',
    description: '已确定住在普宁华庭优品客房：普宁市洪阳镇洪阳大道后山村洪马路西270号。地图仍以洪阳片区参考点展示，导航请使用高德地址搜索。',
    access: '酒店名称和地址来自用户提供信息；入住、停车、房型和国庆前台安排请直接向酒店确认。',
    source: 'https://uri.amap.com/search?keyword=%E6%99%AE%E5%AE%81%E5%8D%8E%E5%BA%AD%E4%BC%98%E5%93%81%E5%AE%A2%E6%88%BF%20%E6%99%AE%E5%B8%82%E6%B4%AA%E9%98%B3%E9%95%87%E6%B4%AA%E9%98%B3%E5%A4%A7%E9%81%93%E5%90%8E%E5%B1%B1%E6%9D%91%E6%B4%AA%E9%A9%AC%E8%B7%AF%E8%A5%BF270%E5%8F%B7&city=%E6%8F%AD%E9%98%B3&view=map', sourceDate: '用户提供地址 2026-09-30', extra: false
  },
  jinxianmen: {
    id: 'jinxianmen', name: '进贤门', short: '进贤门', area: 'jieyang', category: '古建', art: '门',
    coords: [116.3530439, 23.5373863], mapLabel: '进贤门', query: '广东省揭阳市榕城区进贤门', duration: '20–30 分钟',
    description: '揭阳老城的标志性门楼，适合拍照、观察建筑，也便于与学宫、城隍庙串成短步行线。',
    access: '2026 官方旅游线路推荐点。以门楼周边可达范围为主，不预设国庆可以登楼；临时管理按现场。',
    source: 'http://www.jyrongcheng.gov.cn/sy/zjzc/zcly/content/post_1041695.html', sourceDate: '2026-08-27', extra: true
  },
  xuegong: {
    id: 'xuegong', name: '揭阳学宫', short: '揭阳学宫', area: 'jieyang', category: '古建', art: '宫',
    coords: [116.3513719, 23.5384592], mapLabel: '揭阳学宫', query: '广东省揭阳市榕城区揭阳学宫', duration: '45–60 分钟',
    description: '老城文化漫步的重点，慢看院落与儒学建筑。和城隍庙、进贤门距离近，可另留半天一起逛；本次主线未安排榕城。',
    access: '2026 官方旅游线路推荐点；2025 的开放时间只能作历史参考。2026 国庆时间、预约及可入区域仍须复核。',
    source: 'http://www.jyrongcheng.gov.cn/sy/zjzc/zcly/content/post_1041695.html', sourceDate: '2026-08-27', extra: true
  },
  chenghuang: {
    id: 'chenghuang', name: '揭阳城隍庙', short: '城隍庙', area: 'jieyang', category: '古庙', art: '庙',
    coords: [116.3503334, 23.5368941], mapLabel: '揭阳城隍庙', query: '广东省揭阳市榕城区揭阳城隍庙', duration: '30–45 分钟',
    description: '从学宫顺路可到的老城古庙，适合看建筑装饰、感受地方民俗；行程紧时可只看外围。',
    access: '2026 官方旅游线路推荐点；国庆开放时段和现场参访安排待确认，礼让参拜者。',
    source: 'http://www.jyrongcheng.gov.cn/sy/zjzc/zcly/content/post_1041695.html', sourceDate: '2026-08-27', extra: true
  },
  shuangfeng: {
    id: 'shuangfeng', name: '双峰寺', short: '双峰寺', area: 'jieyang', category: '古寺', art: '寺',
    coords: [116.3505999, 23.5339834], mapLabel: '揭阳双峰寺', query: '广东省揭阳市榕城区双峰寺', duration: '30–45 分钟',
    description: '位于老城南侧，适合对寺院建筑更有兴趣时，替换上午的一处景点；不用把所有古建全部走完。',
    access: '2026 官方旅游线路推荐点；国庆可参访区域和开放安排待确认，按寺院现场指引。',
    source: 'http://www.jyrongcheng.gov.cn/sy/zjzc/zcly/content/post_1041695.html', sourceDate: '2026-08-27', extra: true
  },
  jieyanglou: {
    id: 'jieyanglou', name: '揭阳楼', short: '揭阳楼', area: 'jieyang', category: '地标', art: '楼',
    coords: [116.3868993, 23.5677241], mapLabel: '揭阳楼', query: '广东省揭阳市榕城区揭阳楼', duration: '30–45 分钟',
    description: '城北的城市地标，适合喜欢开阔广场与大型建筑的同行者。它不在老城短步行圈内，需另留接驳时间。',
    access: '地图可核验的城市地标；仅按外围观景规划，登楼、室内场馆和国庆活动待核实。',
    source: 'https://www.openstreetmap.org/way/904362690', sourceDate: '2026-09-29 核查', extra: true
  },
  zhongshan: {
    id: 'zhongshan', name: '揭阳中山路街区', short: '中山路', area: 'jieyang', category: '街区', art: '街',
    coords: null, mapLabel: '揭阳中山路·街区搜索', query: '广东省揭阳市榕城区中山路历史文化街区', duration: '1–1.5 小时',
    description: '可另行安排步行看老街、骑楼与商铺，边走边找小吃和饮品；距离本次德安里住宿较远，不作为当晚步行点。',
    access: '2026 官方旅游线路推荐街区；街区可达范围、店铺营业和国庆活动分别按当日信息，不承诺固定夜间演出。',
    source: 'http://www.jyrongcheng.gov.cn/sy/zjzc/zcly/content/post_1041695.html', sourceDate: '2026-08-27', extra: true
  },
  xihu: {
    id: 'xihu', name: '揭阳西湖公园', short: '西湖公园', area: 'jieyang', category: '公园', art: '湖',
    coords: null, mapLabel: '揭阳西湖公园·入口待定位', query: '广东省揭阳市榕城区西湖公园', duration: '45–60 分钟',
    description: '老城游逛之外的湖畔散步选项，适合少看一处古建、换成坐坐走走。如另行安排榕城一日游，记得预留往返普宁的时间。',
    access: '2026 官方旅游线路推荐点；入园、游乐设施和停车安排以现场为准，不预设游船或夜间项目运营。',
    source: 'http://www.jyrongcheng.gov.cn/sy/zjzc/zcly/content/post_1041695.html', sourceDate: '2026-08-27', extra: true
  },
  nanpu: {
    id: 'nanpu', name: '南浦渔歌生态公园', short: '南浦渔歌', area: 'jieyang', category: '公园', art: '湾',
    coords: null, mapLabel: '南浦渔歌生态公园·入口待定位', query: '广东省揭阳市榕城区南浦渔歌生态公园', duration: '45–90 分钟',
    description: '适合喜欢水岸、绿地和开阔景观的同行者，可替代一段老城游览；需要单独查停车与接驳。',
    access: '2026 年 3 月官方报道已正式开放；国庆入口、开放区域及停车情况按最新现场安排确认。',
    source: 'http://www.jieyang.gov.cn/zjjy/lygg/lyzn/jpxl/content/post_1016235.html', sourceDate: '2026-03-03', extra: true
  },
  qinghu: {
    id: 'qinghu', name: '深圳清湖集合', short: '清湖', area: 'shenzhen', category: '集合', art: '聚',
    coords: null, mapLabel: '深圳清湖·具体集合点自定', query: '广东省深圳市龙华区清湖地铁站', duration: '建议约 45 分钟',
    description: '9 月 30 日晚上四人会合，再前往深圳北。清湖只表示集合片区，具体出口或地址由大家约定。',
    access: '来自用户行程草稿；集合时间可调，晚间交通与末班地铁须出发前查询。',
    source: '', sourceDate: '用户行程草稿', extra: false
  },
  'shenzhen-north': {
    id: 'shenzhen-north', name: '深圳北站', short: '深圳北', area: 'shenzhen', category: '交通', art: '站',
    coords: null, mapLabel: '深圳北站·导航确认进站口', query: '广东省深圳市龙华区深圳北站', duration: '去程目标提前 60 分钟到站',
    description: '10 月 1 日凌晨 01:20 出发，9 月 30 日晚上就要前往车站；10 月 3 日 22:35 回到深圳北。',
    access: '时刻来自已购车票；车站进出站安排、检票口与夜间接驳以实际公告为准。',
    source: '', sourceDate: '已购车票截图', extra: false
  }
};

window.TRIP_SOURCES = [
  { title: '洪阳古镇与德安里周边', url: 'http://www.puning.gov.cn/zjpn/lytd/lyjd/content/post_867097.html', date: '2024-08-19', note: '普宁市政府：洪阳行政归属、古迹和地方小吃；不代表国庆营业安排。' },
  { title: '德安里广场改造收尾', url: 'http://www.puning.gov.cn/xwzx/pnxw/content/post_1047610.html', date: '2026-09-16', note: '最新官方报道仍提收尾工程；可参访区域和围挡以现场为准。' },
  { title: '南溪水乡设施与水上运营', url: 'http://www.puning.gov.cn/xwzx/pnxw/content/post_1018899.html', date: '2026-04-29', note: '证实游船码头、临水步道、游客中心与运营公司；未提供国庆船班或票价。' },
  { title: '南溪水乡大港码头', url: 'http://www.puning.gov.cn/xwzx/pnxw/content/post_967902.html', date: '2025-09-17', note: '官方确认具体码头名称及普宁市吉之旅旅游资源开发有限公司。' },
  { title: '百二丘田位置与步行设施', url: 'http://www.puning.gov.cn/zjpn/lytd/lyjd/content/post_472510.html', date: '2020-08-12', note: '灰寨村后山及基础设施的历史介绍；不据此保证当前景区等级、入口或开放。' },
  { title: '南岩古寺位置', url: 'http://www.puning.gov.cn/zjpn/lytd/lylx/content/post_917809.html', date: '2025-02-03', note: '采用南溪镇登峰村飞凤山岭的位置资料；当前参访规则待确认。' },
  { title: '榕城官方旅游推荐', url: 'http://www.jyrongcheng.gov.cn/sy/zjzc/zcly/content/post_1041695.html', date: '2026-08-27', note: '老城古迹、街区与周边地点的推荐依据；不等于国庆专门开放公告。' },
  { title: '榕城景点开放信息历史参考', url: 'http://www.jyrongcheng.gov.cn/sy/zjzc/zcly/content/post_920118.html', date: '2025-02-18', note: '只作历史参考，2025 时间与规则不能直接套用 2026 国庆。' },
  { title: '南浦渔歌生态公园开放', url: 'http://www.jieyang.gov.cn/zjjy/lygg/lyzn/jpxl/content/post_1016235.html', date: '2026-03-03', note: '官方报道已正式开放；国庆临时管理和停车需再确认。' },
  { title: 'OpenStreetMap 地图数据', url: 'https://www.openstreetmap.org/copyright', date: '2026-09-29 核查', note: '已核实点位使用 WGS84。德安里 way/1079645434、普宁站 node/10555760577、家庭附近广场 way/703042212、人民公园 way/135854567、灰寨村 node/2065854535；灰寨村只作山线位置参考。' }
];
