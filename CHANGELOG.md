# 1.0.0 (2019-06-12)


### Bug Fixes

* **VB-1452 考中平台-首页底部版权信息可点击刷新功能多余:** 修改了检查页面的底部版本信息 没有修改登录页的 ([bb7fac6](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/bb7fac6))
* **VB-1462 考中平台，教师机任务列表，日期显示不符合规则，参照ui:** 修改多个班级之间用分割符分割 ([608e657](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/608e657))
* **VB-1469 考中平台，老师不在当前校区，登录提示信息错误:** 用户不存在的时候，提示文案修改 ([a568a4b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/a568a4b))
* **VB-1486 【考中平台-教师机】sit环境，任务列表分页没有参考PRD实现:** 遗漏了星期 ([d787963](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/d787963))
* **VB-1548 考中平台-教师端】不输入用户名，输入密码，点击登录，没有任何提示信息:** 账号登录的报错信息被密码覆盖 ([36d8e20](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/36d8e20))
* **VB-1549 【考中平台-教师机】登录时用户名输入的限制处理:** 用户名的报错信息被密码输入框覆盖了 ([bca5b58](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/bca5b58))
* **VB-1550 【考中平台-教师端】首页，缺少学区:** 要使用校区 而不是学校 ([6faaaff](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/6faaaff))
* **VB-1552 【考中平台-教师端】任务列表页面的搜索只在当前页面生效:** 搜索的时候应该从第一页开始 ([403788d](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/403788d))
* **VB-1558 【考中平台-教师端】考试情况统计详情页面，正在进行状态下的数据不正确:** 详情列表 ([a2c8bab](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/a2c8bab))
* **VB-1567 【考中平台-教师机】登录时教师账号输入框，光标放上去会显示一个红色框出来:** 由于压缩以后的代码，位置发生了改变，样式加载的顺序有问题导致 ([e8c91a6](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/e8c91a6))
* **VB-1584 考中平台-教师机，如图所示，没有学生参考结束本次考试，点返回列表，无法返回:** 数据为空的时候，后台报错，解决方案，如有没有监控数据，不掉用后台 ([5b15e03](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/5b15e03))
* **VB-1644:** 和ui图中，缺少部分内容 ([f0113f6](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/f0113f6))
* **VB-1785:** 处理登出以后白板的问题 ([ebe0dfb](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/ebe0dfb))
* **VB-2775:** 【考中平台】【教师端】查看历史考试任务，不显示答题包状态 ([6392aab](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/6392aab))
* **VB-2782:** 【考中平台】【教师端】未开始的任务名称不可以进行修改，需求中需要修改 ([4b7f94c](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/4b7f94c))
* **VB-2784:** 考中平台-教师端结束练习，练习状态和线上平台不一致 ([652fa07](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/652fa07))
* **VB-2786:** 考中平台-教师端创建练习任务，不需要验证试卷结构是否一致 ([adfd911](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/adfd911))
* **VB-2816:** 【考中平台】联考任务，取消选中班级的所有学生，该班级仍然选中 ([07106b5](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/07106b5))
* **VB-2821:** 【考中平台】学生机-硬件检测，选择不清晰再次听回放后录音不显示波形图 ([58a4633](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/58a4633))
* **VB-2822:** 【考中平台】教师端-监考页面-学生端选择不清晰后再次进行录音操作 ([37cdb7b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/37cdb7b))
* **VB-2830:** 【考中平台】【教师机】学生姓名过长，没有显示...，建议：列表中的数据长度规则需要规范 ([eecc5f0](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/eecc5f0))
* **VB-2842:** 【考中平台】学生机-硬件检测，选择不清晰再次录音到一半时点击结束录音，倒计时显示不正确 ([a047f81](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/a047f81))
* **VB-2853:** 【考中平台】一键检测-教师端 ([8f9c9ab](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/8f9c9ab))
* **VB-2856:** 【考中平台】一键检测-教师端，0设备检测时，不要显示饼图 ([46fcb24](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/46fcb24))
* **VB-2857:** 【考中平台】一键检测-教师端，报告详情中的返回应返回到上一级页面而不是首页 ([921ee9a](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/921ee9a))
* **VB-2860:** 添加提示语句 ([ad874d6](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/ad874d6))
* **VB-2868:** 【考中平台】教师机-任务列表，打包失败的时候去掉“”任务打包失败“”的文案，与整体UI保持一致 ([adb0685](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/adb0685))
* **VB-2906 vb-2903:** 前端添加后台返回的文案 ([fcba15f](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/fcba15f))
* **VB-2913 【考中平台】线上平台的新教师注册后，在考中登录，首页的练习数据没有清掉:** 后台 如果返回的数据中没有某个类型的任务 连key都没有返回 ([eedbb39](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/eedbb39))
* **VB-3087:** antdesign 版本会自动升级导致 ([31b01ea](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/31b01ea))
* **VB-3109:** 【考中平台】学生端启动后不应该显示右上角的关闭X按钮 ([8322d66](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/8322d66))
* **VB-3112:** 【考中平台】在小屏幕机器上任务状态显示有换行 ([3231381](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/3231381))
* **VB-3166:** 【考中平台】优化-学生机：从连接成功页面开始往后的页面都加上举手功能 ([779b73c](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/779b73c))
* **VB-3174:** 【考中平台】学生端：关闭电脑的音量键，进入硬件检测时没有检测出来（没有给出弹窗调整音量） ([50fc35b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/50fc35b))
* **VB-3242:** 【考中平台】教师端：一键检测/正常考试，显示卡片信息不正确 ([5f0e98e](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/5f0e98e))
* **VB-3356:** 【考中平台】教师机-右键：考试过程中右键置为考试失败后，卡片上仍显示正在考试 ([396a76d](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/396a76d))
* **VB-3488:** 【考中平台】教师机-监控模块：考试过程中的状态标识不明显（建锁） ([399015b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/399015b))
* **VB-3591:** 【考中平台】0410公司考：学生机-登录页面，光标放上去后，需要去掉placeholder ([3a1aad2](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/3a1aad2))
* **细节处理:** 添加版本信息 ([c677c1a](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/c677c1a))


### Features

* **VB-1294 结束任务 /n VB-1295 上传答案包:** 前端功能逻辑处理 ([b729fd7](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/b729fd7))
* **VB-1876:** 细节处理 ([241b3d0](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/241b3d0))
* **VB-2789:** 【考中】监考页面，点击数字，和点击“查看详情”一样的效果（测试分支修改） ([94660f3](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/94660f3))
* **VB-2790:** 考试模式下硬件检测，调整耳机，点击 弹框外区域，弹框关闭（测试分支修改） ([4e75021](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/4e75021))
* **VB-2806:** 一键检测报告改版（变更） ([04952b1](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/04952b1))
* **VB-2806:** 一键检测报告改版（变更） ([6680c4a](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/6680c4a))
* **VB-2817:** 任务列表中的开始任务按钮的动作变更处理（创建任务和开始任务中的缺少过渡）（测试分支修改） ([533cdf2](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/533cdf2))
* **允许 gitmodules:** 的提交 ([e7f7496](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/e7f7496))
* update new iconfont ([5d0ce43](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/5d0ce43))
* 结束任务 ([c6aab8b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/c6aab8b))


### Performance Improvements

* **vb-1121:** 细节处理 ([c56b455](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/c56b455))



# 1.0.0 (2019-06-12)


### Bug Fixes

* **VB-1452 考中平台-首页底部版权信息可点击刷新功能多余:** 修改了检查页面的底部版本信息 没有修改登录页的 ([bb7fac6](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/bb7fac6))
* **VB-1462 考中平台，教师机任务列表，日期显示不符合规则，参照ui:** 修改多个班级之间用分割符分割 ([608e657](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/608e657))
* **VB-1469 考中平台，老师不在当前校区，登录提示信息错误:** 用户不存在的时候，提示文案修改 ([a568a4b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/a568a4b))
* **VB-1486 【考中平台-教师机】sit环境，任务列表分页没有参考PRD实现:** 遗漏了星期 ([d787963](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/d787963))
* **VB-1548 考中平台-教师端】不输入用户名，输入密码，点击登录，没有任何提示信息:** 账号登录的报错信息被密码覆盖 ([36d8e20](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/36d8e20))
* **VB-1549 【考中平台-教师机】登录时用户名输入的限制处理:** 用户名的报错信息被密码输入框覆盖了 ([bca5b58](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/bca5b58))
* **VB-1550 【考中平台-教师端】首页，缺少学区:** 要使用校区 而不是学校 ([6faaaff](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/6faaaff))
* **VB-1552 【考中平台-教师端】任务列表页面的搜索只在当前页面生效:** 搜索的时候应该从第一页开始 ([403788d](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/403788d))
* **VB-1558 【考中平台-教师端】考试情况统计详情页面，正在进行状态下的数据不正确:** 详情列表 ([a2c8bab](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/a2c8bab))
* **VB-1567 【考中平台-教师机】登录时教师账号输入框，光标放上去会显示一个红色框出来:** 由于压缩以后的代码，位置发生了改变，样式加载的顺序有问题导致 ([e8c91a6](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/e8c91a6))
* **VB-1584 考中平台-教师机，如图所示，没有学生参考结束本次考试，点返回列表，无法返回:** 数据为空的时候，后台报错，解决方案，如有没有监控数据，不掉用后台 ([5b15e03](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/5b15e03))
* **VB-1644:** 和ui图中，缺少部分内容 ([f0113f6](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/f0113f6))
* **VB-1785:** 处理登出以后白板的问题 ([ebe0dfb](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/ebe0dfb))
* **VB-2775:** 【考中平台】【教师端】查看历史考试任务，不显示答题包状态 ([6392aab](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/6392aab))
* **VB-2782:** 【考中平台】【教师端】未开始的任务名称不可以进行修改，需求中需要修改 ([4b7f94c](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/4b7f94c))
* **VB-2784:** 考中平台-教师端结束练习，练习状态和线上平台不一致 ([652fa07](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/652fa07))
* **VB-2786:** 考中平台-教师端创建练习任务，不需要验证试卷结构是否一致 ([adfd911](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/adfd911))
* **VB-2816:** 【考中平台】联考任务，取消选中班级的所有学生，该班级仍然选中 ([07106b5](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/07106b5))
* **VB-2821:** 【考中平台】学生机-硬件检测，选择不清晰再次听回放后录音不显示波形图 ([58a4633](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/58a4633))
* **VB-2822:** 【考中平台】教师端-监考页面-学生端选择不清晰后再次进行录音操作 ([37cdb7b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/37cdb7b))
* **VB-2830:** 【考中平台】【教师机】学生姓名过长，没有显示...，建议：列表中的数据长度规则需要规范 ([eecc5f0](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/eecc5f0))
* **VB-2842:** 【考中平台】学生机-硬件检测，选择不清晰再次录音到一半时点击结束录音，倒计时显示不正确 ([a047f81](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/a047f81))
* **VB-2853:** 【考中平台】一键检测-教师端 ([8f9c9ab](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/8f9c9ab))
* **VB-2856:** 【考中平台】一键检测-教师端，0设备检测时，不要显示饼图 ([46fcb24](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/46fcb24))
* **VB-2857:** 【考中平台】一键检测-教师端，报告详情中的返回应返回到上一级页面而不是首页 ([921ee9a](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/921ee9a))
* **VB-2860:** 添加提示语句 ([ad874d6](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/ad874d6))
* **VB-2868:** 【考中平台】教师机-任务列表，打包失败的时候去掉“”任务打包失败“”的文案，与整体UI保持一致 ([adb0685](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/adb0685))
* **VB-2906 vb-2903:** 前端添加后台返回的文案 ([fcba15f](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/fcba15f))
* **VB-2913 【考中平台】线上平台的新教师注册后，在考中登录，首页的练习数据没有清掉:** 后台 如果返回的数据中没有某个类型的任务 连key都没有返回 ([eedbb39](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/eedbb39))
* **VB-3087:** antdesign 版本会自动升级导致 ([31b01ea](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/31b01ea))
* **VB-3109:** 【考中平台】学生端启动后不应该显示右上角的关闭X按钮 ([8322d66](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/8322d66))
* **VB-3112:** 【考中平台】在小屏幕机器上任务状态显示有换行 ([3231381](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/3231381))
* **VB-3166:** 【考中平台】优化-学生机：从连接成功页面开始往后的页面都加上举手功能 ([779b73c](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/779b73c))
* **VB-3174:** 【考中平台】学生端：关闭电脑的音量键，进入硬件检测时没有检测出来（没有给出弹窗调整音量） ([50fc35b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/50fc35b))
* **VB-3242:** 【考中平台】教师端：一键检测/正常考试，显示卡片信息不正确 ([5f0e98e](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/5f0e98e))
* **VB-3356:** 【考中平台】教师机-右键：考试过程中右键置为考试失败后，卡片上仍显示正在考试 ([396a76d](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/396a76d))
* **VB-3488:** 【考中平台】教师机-监控模块：考试过程中的状态标识不明显（建锁） ([399015b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/399015b))
* **VB-3591:** 【考中平台】0410公司考：学生机-登录页面，光标放上去后，需要去掉placeholder ([3a1aad2](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/3a1aad2))


### Features

* **VB-1294 结束任务 /n VB-1295 上传答案包:** 前端功能逻辑处理 ([b729fd7](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/b729fd7))
* **VB-1876:** 细节处理 ([241b3d0](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/241b3d0))
* **VB-2789:** 【考中】监考页面，点击数字，和点击“查看详情”一样的效果（测试分支修改） ([94660f3](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/94660f3))
* **VB-2790:** 考试模式下硬件检测，调整耳机，点击 弹框外区域，弹框关闭（测试分支修改） ([4e75021](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/4e75021))
* **VB-2806:** 一键检测报告改版（变更） ([04952b1](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/04952b1))
* **VB-2806:** 一键检测报告改版（变更） ([6680c4a](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/6680c4a))
* **VB-2817:** 任务列表中的开始任务按钮的动作变更处理（创建任务和开始任务中的缺少过渡）（测试分支修改） ([533cdf2](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/533cdf2))
* **允许 gitmodules:** 的提交 ([e7f7496](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/e7f7496))
* update new iconfont ([5d0ce43](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/5d0ce43))
* 结束任务 ([c6aab8b](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/c6aab8b))


### Performance Improvements

* **vb-1121:** 细节处理 ([c56b455](https://gitlab.aidoin.com/VOEP/campus-proxy-front/commit/c56b455))



