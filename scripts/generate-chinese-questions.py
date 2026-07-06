"""
Generate 900 structured Chinese character questions (90 days × 10 per day).
Outputs to src/data/questions.json
"""
import json
import os
import random
import re

random.seed(42)  # reproducible

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'questions.json')

# ============ Character Data ============
# (char, pinyin, meaning, words, pic_or_none)

PHASE1 = [
    ('一','yī','数词，表示1',['一个','一起'],'1️⃣'),
    ('二','èr','数词，表示2',['二月','第二'],'2️⃣'),
    ('三','sān','数词，表示3',['三月','三个'],'3️⃣'),
    ('四','sì','数词，表示4',['四个','四方'],'4️⃣'),
    ('五','wǔ','数词，表示5',['五个','五天'],'5️⃣'),
    ('六','liù','数词，表示6',['六月','六一'],None),
    ('七','qī','数词，表示7',['七天','七月'],None),
    ('八','bā','数词，表示8',['八个','八月'],None),
    ('九','jiǔ','数词，表示9',['九天','九月'],None),
    ('十','shí','数词，表示10',['十个','十月'],None),
    ('百','bǎi','数词，表示100',['一百','百花'],None),
    ('上','shàng','位置在高处',['上面','上学'],'⬆️'),
    ('下','xià','位置在低处',['下面','下雨'],'⬇️'),
    ('左','zuǒ','面向前时的左边',['左右','左边'],None),
    ('右','yòu','面向前时的右边',['右边','左右'],None),
    ('前','qián','面朝的方向',['前面','前后'],None),
    ('后','hòu','背对的方向',['后面','前后'],None),
    ('里','lǐ','内部',['里面','这里'],None),
    ('外','wài','外部',['外面','外公'],None),
    ('中','zhōng','中间',['中国','中间'],None),
    ('大','dà','体积或面积广',['大家','大小'],'🐘'),
    ('小','xiǎo','体积或面积窄',['小鸟','大小'],'🐜'),
    ('多','duō','数量大',['多少','许多'],None),
    ('少','shǎo','数量小',['多少','很少'],None),
    ('长','cháng','两端距离大',['长大','长短'],None),
    ('高','gāo','从下到上距离大',['高兴','高山'],None),
    ('好','hǎo','优点多的',['好人','好看'],None),
    ('白','bái','像雪的颜色',['白天','白云'],'⬜'),
    ('红','hóng','像血的颜色',['红色','红花'],'🔴'),
    ('绿','lǜ','像草的颜色',['绿色','绿草'],'🟢'),
    ('黄','huáng','像金子的颜色',['黄色','黄牛'],'🟡'),
    ('冷','lěng','温度低',['冷热','冷水'],None),
    ('热','rè','温度高',['冷热','热水'],None),
    ('天','tiān','天空',['天上','今天'],'🌤️'),
    ('地','dì','大地',['地方','天地'],'🌍'),
    ('日','rì','太阳',['日出','生日'],'☀️'),
    ('月','yuè','月亮',['月亮','日月'],'🌙'),
    ('星','xīng','天上的发光体',['星星','明星'],'⭐'),
    ('云','yún','天空中的水汽',['白云','云朵'],'☁️'),
    ('风','fēng','流动的空气',['大风','风雨'],None),
    ('雨','yǔ','从天空落下的水滴',['下雨','雨水'],'🌧️'),
    ('雪','xuě','天空落下的冰晶',['下雪','雪花'],'❄️'),
    ('花','huā','植物的繁殖器官',['花朵','花园'],'🌸'),
    ('草','cǎo','地上长的绿色植物',['小草','草地'],'🌿'),
    ('树','shù','高大的植物',['树木','大树'],'🌳'),
    ('木','mù','树木',['木头','树木'],'🪵'),
    ('山','shān','地面上高耸的部分',['山上','高山'],'⛰️'),
    ('水','shuǐ','一种透明液体',['水果','雨水'],'💧'),
    ('火','huǒ','燃烧时发出的光和热',['火车','大火'],'🔥'),
    ('土','tǔ','地面上的泥沙',['土地','泥土'],'🟫'),
    ('石','shí','坚硬的矿物',['石头','石子'],'🪨'),
    ('人','rén','人类',['人民','大人'],'🧑'),
    ('口','kǒu','嘴巴',['开口','口水'],'👄'),
    ('手','shǒu','人体上肢',['手心','小手'],'✋'),
    ('目','mù','眼睛',['目光','目前'],'👁️'),
    ('耳','ěr','耳朵',['耳朵','耳机'],'👂'),
    ('头','tóu','身体最上部',['头发','开头'],None),
    ('心','xīn','心脏',['心里','开心'],None),
    ('牛','niú','一种家畜',['水牛','牛奶'],'🐄'),
    ('马','mǎ','一种动物',['小马','马上'],'🐴'),
    ('羊','yáng','一种家畜',['山羊','小羊'],'🐑'),
    ('鸟','niǎo','有翅膀会飞的动物',['小鸟','飞鸟'],'🐦'),
    ('鱼','yú','生活在水中的动物',['小鱼','金鱼'],'🐟'),
    ('虫','chóng','昆虫',['小虫','虫子'],'🐛'),
    ('爸','bà','父亲',['爸爸','爸妈'],None),
    ('妈','mā','母亲',['妈妈','爸妈'],None),
    ('我','wǒ','第一人称代词',['我们','自我'],None),
    ('你','nǐ','第二人称代词',['你好','你们'],None),
    ('他','tā','第三人称代词',['他们','其他'],None),
    ('去','qù','从所在地到别处',['回去','去年'],None),
    ('来','lái','从别处到这里',['回来','过来'],None),
    ('走','zǒu','用脚移动',['走路','行走'],None),
    ('跑','pǎo','快速地走',['跑步','快跑'],None),
    ('飞','fēi','在空中移动',['飞机','飞鸟飞'],None),
    ('看','kàn','用眼睛观察',['看见','看书'],None),
    ('见','jiàn','看到',['看见','再见'],None),
    ('说','shuō','用嘴表达',['说话','小说'],None),
    ('叫','jiào','大声喊',['大叫','叫声'],None),
    ('笑','xiào','露出愉快的表情',['大笑','笑容'],None),
    ('哭','kū','流泪',['大哭','哭声'],None),
    ('坐','zuò','把臀部放在椅子上',['坐下','请坐'],None),
    ('站','zhàn','直立不动',['站立','站住'],None),
    ('打','dǎ','用手或器具撞击',['打开','打球'],None),
    ('画','huà','用笔描出图形',['画画','画家'],None),
    ('写','xiě','用笔记文字',['写字','写作业'],None),
    ('读','dú','看着文字念出声',['读书','朗读'],None),
    ('玩','wán','做游戏',['玩耍','好玩'],None),
    ('的','de','结构助词',['好的','我的'],None),
    ('了','le','表示动作完成',['好了','来了'],None),
    ('不','bù','表示否定',['不好','不去'],None),
    ('在','zài','存在',['在家','正在'],None),
    ('有','yǒu','存在',['有关','没有'],None),
    ('没','méi','无',['没有','没事'],None),
    ('和','hé','与',['和平','我和你'],None),
    ('是','shì','表示肯定',['不是','可是'],None),
    ('年','nián','一年',['过年','新年'],None),
    ('今','jīn','现在',['今天','今年'],None),
]

PHASE2 = [
    ('春','chūn','一年中的第一季',['春天','春风'],None),
    ('夏','xià','一年中的第二季',['夏天','夏日'],None),
    ('秋','qiū','一年中的第三季',['秋天','秋风'],None),
    ('冬','dōng','一年中的第四季',['冬天','冬日'],None),
    ('河','hé','天然的水道',['小河','河水'],None),
    ('海','hǎi','大洋的边缘',['大海','海水'],None),
    ('湖','hú','陆地上的大水洼',['湖水','西湖'],None),
    ('田','tián','种庄稼的土地',['水田','田地'],None),
    ('路','lù','供人行走的道',['马路','走路'],None),
    ('桥','qiáo','架在水上或路上的建筑',['小桥','石桥'],None),
    ('门','mén','出入口',['大门','门口'],None),
    ('窗','chuāng','墙上透光的洞',['窗户','开窗'],None),
    ('竹','zhú','一种植物',['竹子','竹林'],None),
    ('林','lín','成片的树木',['竹林','树林'],None),
    ('狗','gǒu','一种家畜',['小狗','黄狗'],'🐕'),
    ('猫','māo','一种家畜',['小猫','猫咪'],'🐈'),
    ('鸡','jī','一种家禽',['小鸡','母鸡'],'🐔'),
    ('鸭','yā','一种水禽',['小鸭','鸭子'],'🦆'),
    ('兔','tù','一种小动物',['小兔','白兔'],'🐰'),
    ('蛇','shé','一种爬行动物',['蛇皮','小蛇'],None),
    ('眼','yǎn','眼睛',['眼睛','大眼'],None),
    ('脸','liǎn','面部',['笑脸','洗脸'],None),
    ('牙','yá','嘴里的硬骨',['刷牙','大牙'],None),
    ('足','zú','脚',['足球','手足'],None),
    ('身','shēn','躯体',['身体','身上'],None),
    ('米','mǐ','稻谷去壳后的粒',['大米','米饭'],None),
    ('面','miàn','面粉做的食物',['面条','上面'],None),
    ('果','guǒ','植物的果实',['水果','果子'],'🍎'),
    ('瓜','guā','蔓生植物的果实',['西瓜','瓜果'],None),
    ('奶','nǎi','乳汁',['牛奶','奶奶'],None),
    ('茶','chá','一种饮料',['茶叶','喝茶'],None),
    ('饭','fàn','煮熟的米食',['吃饭','午饭'],None),
    ('菜','cài','蔬菜',['种菜','白菜'],None),
    ('书','shū','装订成册的著作',['书本','读书'],None),
    ('笔','bǐ','写字的工具',['铅笔','毛笔'],None),
    ('纸','zhǐ','写字画画用的薄片',['白纸','纸巾'],None),
    ('字','zì','文字',['写字','汉字'],None),
    ('课','kè','教学的科目',['上课','课文'],None),
    ('学','xué','学习',['学习','上学'],None),
    ('校','xiào','教学的场所',['学校','校园'],None),
    ('师','shī','传授知识的人',['老师','师长'],None),
    ('包','bāo','装东西的容器',['书包','面包'],None),
    ('衣','yī','穿在身上的',['衣服','大衣'],None),
    ('帽','mào','戴在头上的',['帽子','草帽'],None),
    ('鞋','xié','穿在脚上的',['鞋子','皮鞋'],None),
    ('吃','chī','把食物送入口中',['吃饭','好吃'],None),
    ('喝','hē','把液体送入口中',['喝水','喝茶'],None),
    ('穿','chuān','把衣物套在身上',['穿衣','穿上'],None),
    ('洗','xǐ','用水使干净',['洗手','洗脸'],None),
    ('听','tīng','用耳朵感受声音',['听话','听见'],None),
    ('做','zuò','制造',['做工','做事'],None),
    ('问','wèn','向人打听',['问好','学问'],None),
    ('答','dá','回答',['回答','答案'],None),
    ('想','xiǎng','思考',['想要','想象'],None),
    ('拿','ná','用手取',['拿起','拿来'],None),
    ('放','fàng','搁置',['放下','放心'],None),
    ('开','kāi','使关闭的不再关闭',['打开','开心'],None),
    ('关','guān','使打开的不再打开',['关心','关上'],None),
    ('找','zhǎo','寻找',['找到','寻找'],None),
    ('给','gěi','交付',['给我','送给'],None),
    ('让','ràng','允许',['让人','不让'],None),
    ('回','huí','从别处到原来的地方',['回来','回家'],None),
    ('过','guò','经过',['过来','过去'],None),
    ('种','zhòng','把种子放入土中',['种花','种树'],None),
    ('送','sòng','把东西给人',['送给','送人'],None),
    ('很','hěn','非常',['很好','很大'],None),
    ('都','dōu','全部',['都是','全都'],None),
    ('也','yě','同样',['也是','也好'],None),
    ('真','zhēn','的确',['真好','真的'],None),
    ('最','zuì','极',['最好','最大'],None),
    ('美','měi','好看',['美丽','美好'],None),
    ('亮','liàng','光线强',['月亮','明亮'],None),
    ('黑','hēi','像墨的颜色',['黑色','天黑'],None),
    ('快','kuài','速度大',['快乐','快车'],None),
    ('乐','lè','欢喜',['快乐','可乐'],None),
    ('早','zǎo','天刚亮的时候',['早上','早晨'],None),
    ('午','wǔ','白天十二点',['中午','下午'],None),
    ('晚','wǎn','太阳落了以后',['晚上','夜晚'],None),
    ('东','dōng','太阳升起的方向',['东方','东西'],None),
    ('西','xī','太阳落的方向',['西方','东西'],None),
    ('南','nán','面向东时的右边',['南方','南瓜'],None),
    ('北','běi','面向东时的左边',['北方','北风'],None),
    ('家','jiā','住所',['大家','回家'],None),
    ('公','gōng','属于大家的',['公园','公开'],None),
    ('车','chē','有轮子的交通工具',['汽车','火车'],None),
    ('船','chuán','水上交通工具',['小船','大船'],None),
    ('电','diàn','一种能量',['电话','电视'],None),
    ('话','huà','说出来的内容',['说话','电话'],None),
    ('光','guāng','明亮的',['月光','阳光'],None),
    ('色','sè','颜色',['颜色','红色'],None),
    ('点','diǎn','小的痕迹',['雨点','一点'],None),
    ('样','yàng','形状',['一样','样子'],None),
    ('方','fāng','四个角都是直角',['方向','四方'],None),
    ('可','kě','能够',['可是','可以'],None),
]

PHASE3 = [
    ('拉','lā','用力使向自己方向移动',['拉开','拉手'],None),
    ('推','tuī','用力使向前移动',['推开','推门'],None),
    ('抱','bào','用手臂围住',['抱住','拥抱'],None),
    ('拍','pāi','用手掌打',['拍手','拍球'],None),
    ('跳','tiào','两脚用力离开地面',['跳高','跳绳'],None),
    ('爬','pá','伏地移动',['爬山','爬行'],None),
    ('停','tíng','不再前进',['停下','停止'],None),
    ('带','dài','随身拿着',['带来','皮带'],None),
    ('掉','diào','落下',['掉下','丢掉'],None),
    ('借','jiè','暂时使用别人的',['借书','借用'],None),
    ('还','huán','归还',['还给','还有'],None),
    ('讲','jiǎng','把事情说出来',['讲话','讲故事'],None),
    ('告','gào','说给人知道',['告诉','广告'],None),
    ('忘','wàng','不记得',['忘记','忘了'],None),
    ('记','jì','不忘记',['记住','日记'],None),
    ('数','shǔ','逐个地计算',['数数','数学'],None),
    ('变','biàn','和原来不同',['变化','变成'],None),
    ('换','huàn','把原来的换成别的',['换衣','交换'],None),
    ('选','xuǎn','从中间挑',['选择','选出'],None),
    ('搬','bān','移动东西的位置',['搬家','搬走'],None),
    ('远','yuǎn','距离大',['远近','远方'],None),
    ('近','jìn','距离小',['远近','最近'],None),
    ('新','xīn','刚有的',['新书','新年'],None),
    ('旧','jiù','过去的',['旧的','旧书'],None),
    ('轻','qīng','重量小',['年轻','轻重'],None),
    ('重','zhòng','分量大',['轻重','重要'],None),
    ('胖','pàng','脂肪多',['胖子','胖瘦'],None),
    ('瘦','shòu','脂肪少',['胖瘦','瘦小'],None),
    ('干','gān','没有水分',['干净','干草'],None),
    ('净','jìng','清洁',['干净','清净'],None),
    ('安','ān','平静',['平安','安心'],None),
    ('全','quán','完备',['安全','全部'],None),
    ('先','xiān','时间在前的',['先后','先生'],None),
    ('第','dì','表次序',['第一','第二'],None),
    ('常','cháng','经常',['非常','常常'],None),
    ('朋','péng','朋友',['朋友','亲朋'],None),
    ('友','yǒu','好朋友',['朋友','友好'],None),
    ('孩','hái','儿童',['小孩','孩子'],None),
    ('姐','jiě','比自己大的女性同辈',['姐姐','大姐'],None),
    ('哥','gē','比自己大的男性同辈',['哥哥','大哥'],None),
    ('弟','dì','比自己小的男性同辈',['弟弟','兄弟'],None),
    ('妹','mèi','比自己小的女性同辈',['妹妹','姐妹'],None),
    ('爷','yé','祖父',['爷爷','老爷'],None),
    ('村','cūn','乡下人聚居的地方',['农村','小村'],None),
    ('城','chéng','人口密集的大地方',['城市','小城'],None),
    ('楼','lóu','两层以上的房屋',['楼房','上楼'],None),
    ('房','fáng','住人的建筑物',['房子','房间'],None),
    ('院','yuàn','房屋前后的空地',['医院','院子'],None),
    ('床','chuáng','睡觉的家具',['起床','小床'],None),
    ('桌','zhuō','一种家具',['桌子','课桌'],None),
    ('椅','yǐ','坐的家具',['椅子','桌椅'],None),
    ('灯','dēng','照明的器具',['电灯','开灯'],None),
    ('钟','zhōng','计时的器具',['时钟','钟声'],None),
    ('球','qiú','圆形的物体',['足球','皮球'],None),
    ('歌','gē','能唱的文词',['唱歌','歌曲'],None),
    ('舞','wǔ','舞蹈',['跳舞','舞蹈'],None),
    ('事','shì','事情',['好事','事情'],None),
    ('物','wù','东西',['动物','植物'],None),
    ('叶','yè','植物的叶片',['叶子','树叶'],None),
    ('根','gēn','植物在土里的部分',['树根','根本'],None),
    ('朵','duǒ','花的量词',['花朵','几朵'],None),
    ('连','lián','连接',['连接','连忙'],None),
    ('对','duì','正确',['对的','不对'],None),
    ('错','cuò','不正确',['不错','错了'],None),
    ('正','zhèng','不偏斜',['正在','正面'],None),
    ('反','fǎn','与正相反',['反面','正反'],None),
    ('像','xiàng','相似',['好像','画像'],None),
    ('比','bǐ','比较',['对比','比一比'],None),
    ('更','gèng','越发',['更好','更大'],None),
    ('把','bǎ','拿',['把手','一把'],None),
    ('被','bèi','表示被动',['被子','被动'],None),
    ('所','suǒ','处所',['所以','所有'],None),
    ('以','yǐ','用',['所以','以后'],None),
    ('为','wèi','因为',['因为','为了'],None),
    ('每','měi','逐一',['每天','每个'],None),
    ('些','xiē','表示不定的数量',['一些','那些'],None),
    ('两','liǎng','二',['两个','两天'],None),
    ('几','jǐ','询问数量',['几个','几天'],None),
    ('又','yòu','再',['又是','又大又圆'],None),
    ('就','jiù','立刻',['就是','就要'],None),
    ('那','nà','指示代词',['那里','那个'],None),
    ('这','zhè','指示代词',['这里','这个'],None),
]

# ============ Distractor Generation ============

# All pinyins for distractor generation
ALL_PINYINS = list(set(c[1] for c in PHASE1 + PHASE2 + PHASE3))

# Tone variation pairs for char_to_pinyin distractors
TONE_VARIANTS = {
    'ā': ['á', 'ǎ', 'à'], 'á': ['ā', 'ǎ', 'à'], 'ǎ': ['ā', 'á', 'à'], 'à': ['ā', 'á', 'ǎ'],
    'ē': ['é', 'ě', 'è'], 'é': ['ē', 'ě', 'è'], 'ě': ['ē', 'é', 'è'], 'è': ['ē', 'é', 'ě'],
    'ī': ['í', 'ǐ', 'ì'], 'í': ['ī', 'ǐ', 'ì'], 'ǐ': ['ī', 'í', 'ì'], 'ì': ['ī', 'í', 'ǐ'],
    'ō': ['ó', 'ǒ', 'ò'], 'ó': ['ō', 'ǒ', 'ò'], 'ǒ': ['ō', 'ó', 'ò'], 'ò': ['ō', 'ó', 'ǒ'],
    'ū': ['ú', 'ǔ', 'ù'], 'ú': ['ū', 'ǔ', 'ù'], 'ǔ': ['ū', 'ú', 'ù'], 'ù': ['ū', 'ú', 'ǔ'],
    'ǖ': ['ǘ', 'ǚ', 'ǜ'], 'ǘ': ['ǖ', 'ǚ', 'ǜ'], 'ǚ': ['ǖ', 'ǘ', 'ǜ'], 'ǜ': ['ǖ', 'ǘ', 'ǚ'],
}

# Similar-sound pinyin pairs
SIMILAR_SOUNDS = [
    ('b', 'p'), ('d', 't'), ('g', 'k'), ('h', 'f'),
    ('z', 'zh'), ('c', 'ch'), ('s', 'sh'),
    ('n', 'l'), ('n', 'ng'), ('j', 'q'),
]

def get_pinyin_base(pinyin):
    """Extract base (initial + final without tone)"""
    tone_chars = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
    base = pinyin
    for tc in tone_chars:
        base = base.replace(tc, '')
    return base

def generate_pinyin_distractors(correct_pinyin, count=2):
    """Generate wrong pinyin options that are similar but different"""
    distractors = set()

    # Strategy 1: Change tone mark
    for char_in, variants in TONE_VARIANTS.items():
        if char_in in correct_pinyin:
            for v in variants:
                candidate = correct_pinyin.replace(char_in, v, 1)
                if candidate != correct_pinyin:
                    distractors.add(candidate)
            break

    # Strategy 2: Use similar-sound pinyins from the pool
    correct_base = get_pinyin_base(correct_pinyin)
    for p in ALL_PINYINS:
        if p == correct_pinyin:
            continue
        base = get_pinyin_base(p)
        # Check if initial is similar
        for s1, s2 in SIMILAR_SOUNDS:
            if (correct_base.startswith(s1) and base.startswith(s2)) or \
               (correct_base.startswith(s2) and base.startswith(s1)):
                distractors.add(p)

    # Strategy 3: Fallback - random pinyins
    if len(distractors) < count:
        candidates = [p for p in ALL_PINYINS if p != correct_pinyin]
        random.shuffle(candidates)
        for c in candidates:
            distractors.add(c)
            if len(distractors) >= count:
                break

    result = list(distractors)[:count]
    # Ensure no duplicates with correct
    result = [r for r in result if r != correct_pinyin][:count]
    while len(result) < count:
        r = random.choice(ALL_PINYINS)
        if r != correct_pinyin and r not in result:
            result.append(r)
    return result


def generate_char_distractors(correct_char, all_chars, count=2):
    """Generate wrong character options for pinyin_to_char"""
    candidates = [c[0] for c in all_chars if c[0] != correct_char]
    random.shuffle(candidates)
    return candidates[:count]


def generate_meaning_distractors(correct_meaning, all_chars, count=2):
    """Generate wrong meaning options"""
    all_meanings = list(set(c[2] for c in all_chars if c[2] != correct_meaning))
    random.shuffle(all_meanings)
    return all_meanings[:count]


def pick_word_with_blank(char, words):
    """Pick a word containing char and replace char with blank"""
    suitable = [w for w in words if len(w) == 2 and char in w]
    if not suitable:
        suitable = [w for w in words if char in w]
    if not suitable:
        return None, None
    word = random.choice(suitable)
    blank_word = word.replace(char, '（ ）', 1)
    return blank_word, word


def generate_word_distractors(char, correct_word, all_chars, count=2):
    """Generate wrong character options for char_to_word"""
    candidates = []
    for c in all_chars:
        if c[0] == char:
            continue
        # Prefer characters that could plausibly fill the blank
        candidates.append(c[0])
    random.shuffle(candidates)
    return candidates[:count]


# ============ Question Generation ============

def make_options(correct, distractors, shuffle=True):
    """Create options array with correct answer position"""
    options = [correct] + distractors
    if shuffle:
        random.shuffle(options)
    answer_idx = options.index(correct)
    return options, answer_idx


def fill_day_to_10(day_questions, day, q_counter, phase_chars, all_chars):
    """Ensure a day has exactly 10 questions, filling gaps with fallback types"""
    while len(day_questions) < 10:
        char_data = random.choice(phase_chars)
        char, pinyin, meaning, words, pic = char_data
        # Try char_to_pinyin first (always works), then pinyin_to_char
        for fallback_type in ['char_to_pinyin', 'pinyin_to_char']:
            q = build_question(fallback_type, (fallback_type, char, pinyin, meaning, words, pic),
                             day, q_counter, all_chars)
            if q:
                day_questions.append(q)
                q_counter += 1
                break
    return day_questions, q_counter


def generate_questions():
    questions = []
    q_counter = 0

    # Build lookup structures
    all_chars = PHASE1 + PHASE2 + PHASE3

    # ============ Phase 1: Day 1-30 ============
    # 98 chars, 30 days × 10 = 300 questions
    # Per day: 5 char_to_pinyin + 4 pinyin_to_char + 1 char_to_pic
    p1_pool = []
    for char, pinyin, meaning, words, pic in PHASE1:
        p1_pool.append(('char_to_pinyin', char, pinyin, meaning, words, pic))
        p1_pool.append(('pinyin_to_char', char, pinyin, meaning, words, pic))
        if pic:
            p1_pool.append(('char_to_pic', char, pinyin, meaning, words, pic))

    random.shuffle(p1_pool)

    for day in range(1, 31):
        day_questions = []
        types_needed = (
            ['char_to_pinyin'] * 5 +
            ['pinyin_to_char'] * 4 +
            ['char_to_pic'] * 1
        )

        for qtype in types_needed:
            found = False
            for i in range(len(p1_pool)):
                if p1_pool[i][0] == qtype:
                    entry = p1_pool.pop(i)
                    q = build_question(qtype, entry, day, q_counter, all_chars)
                    if q:
                        day_questions.append(q)
                        q_counter += 1
                        found = True
                        break

            if not found:
                # Fallback: generate from any char with the requested or alternative type
                char_data = random.choice(PHASE1)
                for alt_type in [qtype, 'char_to_pinyin', 'pinyin_to_char']:
                    q = build_question(alt_type, (alt_type, *char_data), day, q_counter, all_chars)
                    if q:
                        day_questions.append(q)
                        q_counter += 1
                        break

        day_questions, q_counter = fill_day_to_10(day_questions, day, q_counter, PHASE1, all_chars)
        questions.extend(day_questions)

    # ============ Phase 2: Day 31-60 ============
    # 92 chars, 30 days × 10 = 300 questions
    # Per day: 3 char_to_pinyin + 3 pinyin_to_char + 2 char_to_word + 2 char_to_meaning
    p2_pool = []
    for char, pinyin, meaning, words, pic in PHASE2:
        p2_pool.append(('char_to_pinyin', char, pinyin, meaning, words, pic))
        p2_pool.append(('pinyin_to_char', char, pinyin, meaning, words, pic))
        p2_pool.append(('char_to_word', char, pinyin, meaning, words, pic))
        p2_pool.append(('char_to_meaning', char, pinyin, meaning, words, pic))

    random.shuffle(p2_pool)

    for day in range(31, 61):
        day_questions = []
        types_needed = (
            ['char_to_pinyin'] * 3 +
            ['pinyin_to_char'] * 3 +
            ['char_to_word'] * 2 +
            ['char_to_meaning'] * 2
        )

        for qtype in types_needed:
            found = False
            for i in range(len(p2_pool)):
                if p2_pool[i][0] == qtype:
                    entry = p2_pool.pop(i)
                    q = build_question(qtype, entry, day, q_counter, all_chars)
                    if q:
                        day_questions.append(q)
                        q_counter += 1
                        found = True
                        break

            if not found:
                char_data = random.choice(PHASE2)
                for alt_type in [qtype, 'char_to_pinyin', 'pinyin_to_char']:
                    q = build_question(alt_type, (alt_type, *char_data), day, q_counter, all_chars)
                    if q:
                        day_questions.append(q)
                        q_counter += 1
                        break

        day_questions, q_counter = fill_day_to_10(day_questions, day, q_counter, PHASE2, all_chars)
        questions.extend(day_questions)

    # ============ Phase 3: Day 61-90 ============
    # 83 chars, 30 days × 10 = 300 questions
    # Per day: 2 char_to_pinyin + 3 pinyin_to_char + 3 char_to_word + 2 char_to_meaning
    p3_pool = []
    for char, pinyin, meaning, words, pic in PHASE3:
        p3_pool.append(('char_to_pinyin', char, pinyin, meaning, words, pic))
        p3_pool.append(('pinyin_to_char', char, pinyin, meaning, words, pic))
        p3_pool.append(('char_to_word', char, pinyin, meaning, words, pic))
        p3_pool.append(('char_to_meaning', char, pinyin, meaning, words, pic))

    random.shuffle(p3_pool)

    for day in range(61, 91):
        day_questions = []
        types_needed = (
            ['char_to_pinyin'] * 2 +
            ['pinyin_to_char'] * 3 +
            ['char_to_word'] * 3 +
            ['char_to_meaning'] * 2
        )

        for qtype in types_needed:
            found = False
            for i in range(len(p3_pool)):
                if p3_pool[i][0] == qtype:
                    entry = p3_pool.pop(i)
                    q = build_question(qtype, entry, day, q_counter, all_chars)
                    if q:
                        day_questions.append(q)
                        q_counter += 1
                        found = True
                        break

            if not found:
                char_data = random.choice(PHASE3)
                for alt_type in [qtype, 'char_to_pinyin', 'pinyin_to_char']:
                    q = build_question(alt_type, (alt_type, *char_data), day, q_counter, all_chars)
                    if q:
                        day_questions.append(q)
                        q_counter += 1
                        break

        day_questions, q_counter = fill_day_to_10(day_questions, day, q_counter, PHASE3, all_chars)
        questions.extend(day_questions)

    return questions


def build_question(qtype, entry, day, seq, all_chars=None):
    """Build a single question dict"""
    _, char, pinyin, meaning, words, pic = entry
    if all_chars is None:
        all_chars = PHASE1 + PHASE2 + PHASE3

    difficulty = 1 if day <= 30 else (2 if day <= 60 else 3)
    level = difficulty
    qid = f"ch_d{day:02d}_q{(seq % 10) + 1:02d}"

    if qtype == 'char_to_pinyin':
        distractors = generate_pinyin_distractors(pinyin, 2)
        options, answer = make_options(pinyin, distractors)
        return {
            'id': qid, 'subject': 'chinese', 'level': level,
            'type': 'char_to_pinyin', 'day': day,
            'content': char, 'answer': answer,
            'options': options, 'difficulty': difficulty, 'audio': None,
        }

    elif qtype == 'pinyin_to_char':
        distractors = generate_char_distractors(char, all_chars, 2)
        options, answer = make_options(char, distractors)
        return {
            'id': qid, 'subject': 'chinese', 'level': level,
            'type': 'pinyin_to_char', 'day': day,
            'content': pinyin, 'answer': answer,
            'options': options, 'difficulty': difficulty,
            'audio': f'/audio/chars/{char}.mp3',
        }

    elif qtype == 'char_to_pic':
        if not pic:
            return None
        # Get 2 other emojis as distractors
        other_pics = [c[4] for c in PHASE1 if c[4] and c[4] != pic]
        random.shuffle(other_pics)
        distractors = other_pics[:2]
        options, answer = make_options(pic, distractors)
        return {
            'id': qid, 'subject': 'chinese', 'level': level,
            'type': 'char_to_pic', 'day': day,
            'content': char, 'answer': answer,
            'options': options, 'difficulty': difficulty, 'audio': None,
        }

    elif qtype == 'char_to_word':
        blank_word, full_word = pick_word_with_blank(char, words)
        if not blank_word:
            return None
        distractors = generate_word_distractors(char, full_word, all_chars, 2)
        options, answer = make_options(char, distractors)
        return {
            'id': qid, 'subject': 'chinese', 'level': level,
            'type': 'char_to_word', 'day': day,
            'content': blank_word, 'answer': answer,
            'options': options, 'difficulty': difficulty, 'audio': None,
        }

    elif qtype == 'char_to_meaning':
        distractors = generate_meaning_distractors(meaning, all_chars, 2)
        options, answer = make_options(meaning, distractors)
        return {
            'id': qid, 'subject': 'chinese', 'level': level,
            'type': 'char_to_meaning', 'day': day,
            'content': char, 'answer': answer,
            'options': options, 'difficulty': difficulty, 'audio': None,
        }

    return None


def main():
    print("📝 Generating 900 Chinese character questions...")
    questions = generate_questions()

    # Remove None entries
    questions = [q for q in questions if q is not None]

    # Re-number IDs sequentially per day
    day_counters = {}
    for q in questions:
        d = q['day']
        if d not in day_counters:
            day_counters[d] = 0
        day_counters[d] += 1
        q['id'] = f"ch_d{d:02d}_q{day_counters[d]:02d}"

    # Validate
    total_days = set(q['day'] for q in questions)
    print(f"  Total questions: {len(questions)}")
    print(f"  Days covered: {len(total_days)} (Day {min(total_days)} - Day {max(total_days)})")

    # Check per-day counts
    from collections import Counter
    day_counts = Counter(q['day'] for q in questions)
    avg = sum(day_counts.values()) / len(day_counts)
    print(f"  Avg questions/day: {avg:.1f}")
    print(f"  Min: {min(day_counts.values())}, Max: {max(day_counts.values())}")

    # Check for duplicate IDs
    ids = [q['id'] for q in questions]
    dupes = [id for id, count in Counter(ids).items() if count > 1]
    if dupes:
        print(f"  ⚠️  Duplicate IDs: {dupes}")
    else:
        print("  ✅ No duplicate IDs")

    # Check type distribution
    type_counts = Counter(q['type'] for q in questions)
    print(f"  Type distribution: {dict(type_counts)}")

    # Write output
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"\n🎉 Written to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
