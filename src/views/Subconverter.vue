<template>
	<div>
		<el-row style="margin-top: 10px">
			<el-col>
				<el-card>
					<div slot="header">
						Subscription Converter
						<svg-icon icon-class="github" style="margin-left: 20px" @click="goToProject"
						/>
						<div style="display: inline-block; position:absolute; right: 20px">
							{{ backendVersion }}
						</div>
					</div>
					<el-container>
						<el-form :model="form" label-width="80px" label-position="left" style="width: 100%">
							<el-form-item label="模式设置:">
								<el-radio v-model="advanced" label="1">
									基础模式
								</el-radio>
								<el-radio v-model="advanced" label="2">
									进阶模式
								</el-radio>
							</el-form-item>
							<el-form-item label="订阅链接:">
								<el-input v-model="form.sourceSubUrl" type="textarea" rows="3" placeholder="支持订阅或ss/ssr/vmess链接，多个链接每行一个或用 | 分隔"
								@blur="saveSubUrl" />
							</el-form-item>
							<el-form-item label="客户端:">
								<el-select v-model="form.clientType" style="width: 100%">
									<el-option v-for="(v, k) in options.clientTypes" :key="k" :label="k" :value="v">
									</el-option>
								</el-select>
							</el-form-item>
							<div v-if="advanced === '2'">
								<el-form-item label="后端地址:">
									<el-autocomplete style="width: 100%" v-model="form.customBackend" :fetch-suggestions="backendSearch"
									placeholder="动动小手，（建议）自行搭建后端服务。例：http://127.0.0.1:25500/sub?">
										<el-button slot="append" @click="gotoGayhub" icon="el-icon-link">
											前往项目仓库
										</el-button>
									</el-autocomplete>
								</el-form-item>
								<el-form-item label="远程配置:">
									<el-select v-model="form.remoteConfig" allow-create filterable placeholder="请选择"
									style="width: 100%">
										<el-option-group v-for="group in options.remoteConfig" :key="group.label"
										:label="group.label">
											<el-option v-for="item in group.options" :key="item.value" :label="item.label"
											:value="item.value">
											</el-option>
										</el-option-group>
										<el-button slot="append" @click="gotoRemoteConfig" icon="el-icon-link">
											配置示例
										</el-button>
									</el-select>
								</el-form-item>
								<el-form-item label="Include:">
									<el-input v-model="form.includeRemarks" placeholder="节点名包含的关键字，支持正则" />
								</el-form-item>
								<el-form-item label="Exclude:">
									<el-input v-model="form.excludeRemarks" placeholder="节点名不包含的关键字，支持正则"
									/>
								</el-form-item>
								<el-form-item label="FileName:">
									<el-input v-model="form.filename" placeholder="返回的订阅文件名" />
								</el-form-item>
								<el-form-item label-width="0px">
									<el-row type="flex">
										<el-col>
											<el-checkbox v-model="form.nodeList" label="输出为 Node List" border>
											</el-checkbox>
										</el-col>
										<el-popover placement="bottom" v-model="form.extraset">
											<el-row>
												<el-checkbox v-model="form.emoji" label="Emoji">
												</el-checkbox>
											</el-row>
											<el-row>
												<el-checkbox v-model="form.scv" label="跳过证书验证">
												</el-checkbox>
											</el-row>
											<el-row>
												<el-checkbox v-model="form.udp" @change="needUdp = true" label="启用 UDP">
												</el-checkbox>
											</el-row>
											<el-row>
												<el-checkbox v-model="form.appendType" label="节点类型">
												</el-checkbox>
											</el-row>
											<el-row>
												<el-checkbox v-model="form.sort" label="排序节点">
												</el-checkbox>
											</el-row>
											<el-row>
												<el-checkbox v-model="form.fdn" label="过滤非法节点">
												</el-checkbox>
											</el-row>
											<el-button slot="reference">
												更多选项
											</el-button>
										</el-popover>
										<el-popover placement="bottom" style="margin-left: 10px">
											<el-row>
												<el-checkbox v-model="form.tpl.surge.doh" label="Surge.DoH">
												</el-checkbox>
											</el-row>
											<el-row>
												<el-checkbox v-model="form.tpl.clash.doh" label="Clash.DoH">
												</el-checkbox>
											</el-row>
											<el-row>
												<el-checkbox v-model="form.insert" label="网易云">
												</el-checkbox>
											</el-row>
											<el-button slot="reference">
												定制功能
											</el-button>
										</el-popover>
									</el-row>
								</el-form-item>
							</div>
							<div style="margin-top: 50px">
							</div>
							<el-divider content-position="center">
								<i class="el-icon-magic-stick">
								</i>
							</el-divider>
							<el-form-item label="定制订阅:">
								<el-input class="copy-content" disabled v-model="customSubUrl">
									<el-button slot="append" v-clipboard:copy="customSubUrl" v-clipboard:success="onCopy"
									ref="copy-btn" icon="el-icon-document-copy">
										复制
									</el-button>
								</el-input>
							</el-form-item>
							<el-form-item label="订阅短链:">
								<el-input class="copy-content" disabled v-model="curtomShortSubUrl">
									<el-button slot="append" v-clipboard:copy="curtomShortSubUrl" v-clipboard:success="onCopy"
									ref="copy-btn" icon="el-icon-document-copy">
										复制
									</el-button>
								</el-input>
							</el-form-item>
							<el-form-item label-width="0px" style="margin-top: 40px; text-align: center">
								<el-button style="width: 140px" type="danger" @click="makeUrl" :disabled="form.sourceSubUrl.length === 0">
									生成订阅链接
								</el-button>
								<el-button style="width: 140px" type="danger" @click="makeShortUrl" :loading="loading"
								:disabled="customSubUrl.length === 0">
									生成短链接
								</el-button>
								<!-- <el-button style="width: 140px" type="primary" @click="surgeInstall"
								icon="el-icon-connection">一键导入Surge</el-button> -->
							</el-form-item>
							<el-form-item label-width="0px" style="text-align: center">
								<el-button style="width: 140px" type="primary" @click="dialogUploadConfigVisible = true"
								icon="el-icon-upload" :loading="loading">
									上传配置
								</el-button>
								<el-button style="width: 140px" type="primary" @click="clashInstall" icon="el-icon-connection"
								:disabled="customSubUrl.length === 0">
									一键导入 Clash
								</el-button>
							</el-form-item>
							<el-form-item label-width="0px" style="text-align: center">
								<el-button style="width: 290px" type="primary" @click="dialogLoadConfigVisible = true"
								icon="el-icon-copy-document" :loading="loading">
									从 URL 解析
								</el-button>
							</el-form-item>
						</el-form>
					</el-container>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :visible.sync="dialogUploadConfigVisible" :show-close="false"
		:close-on-click-modal="false" :close-on-press-escape="false" width="700px">
			<div slot="title">
				Remote config upload
				<el-popover trigger="hover" placement="right" style="margin-left: 10px">
					<el-link type="primary" :href="sampleConfig" target="_blank" icon="el-icon-info">
						参考配置
					</el-link>
					<i class="el-icon-question" slot="reference">
					</i>
				</el-popover>
			</div>
			<el-form label-position="left">
				<el-form-item prop="uploadConfig">
					<el-input v-model="uploadConfig" type="textarea" :autosize="{ minRows: 15, maxRows: 30 }"
					maxlength="10000" show-word-limit>
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="uploadConfig = ''; dialogUploadConfigVisible = false">
					取 消
				</el-button>
				<el-button type="primary" @click="confirmUploadConfig" :disabled="uploadConfig.length === 0">
					确 定
				</el-button>
			</div>
		</el-dialog>
		<el-dialog :visible.sync="dialogLoadConfigVisible" :show-close="false"
		:close-on-click-modal="false" :close-on-press-escape="false" width="700px">
			<div slot="title">
				解析 Subconverter 链接
			</div>
			<el-form label-position="left" :inline="true">
				<el-form-item prop="uploadConfig" label="订阅链接：" label-width="85px">
					<el-input v-model="loadConfig" style="width: 565px">
					</el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="loadConfig = ''; dialogLoadConfigVisible = false">
					取 消
				</el-button>
				<el-button type="primary" @click="confirmLoadConfig" :disabled="loadConfig.length === 0">
					确 定
				</el-button>
			</div>
		</el-dialog>
	</div>
</template>
<script>
	const project = process.env.VUE_APP_PROJECT const remoteConfigSample = process.env.VUE_APP_SUBCONVERTER_REMOTE_CONFIG const gayhubRelease = process.env.VUE_APP_BACKEND_RELEASE const defaultBackend = process.env.VUE_APP_SUBCONVERTER_DEFAULT_BACKEND + '/sub?'const shortUrlBackend = process.env.VUE_APP_MYURLS_API const configUploadBackend = process.env.VUE_APP_CONFIG_UPLOAD_API const tgBotLink = process.env.VUE_APP_BOT_LINK

	export
default {
		data() {
			return {
				backendVersion:
				"",
				advanced: "2",

				// 是否为 PC 端
				isPC: true,

				options: {
					clientTypes: {
						Clash: "clash",
						Surge: "surge&ver=4",
						Quantumult: "quan",
						QuantumultX: "quanx",
						Mellow: "mellow",
						Surfboard: "surfboard",
						Loon: "loon",
						singbox: "singbox",
						ss: "ss",
						ssd: "ssd",
						sssub: "sssub",
						ssr: "ssr",
						ClashR: "clashr",
						V2Ray: "v2ray",
						Trojan: "trojan",
						Surge3: "surge&ver=3",
					},
					backendOptions: [{
						value: "http://127.0.0.1:25500/sub?"
					}],
					remoteConfig: [{
						label: "通用",
						options: [{
							label: "默认",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_NoAuto.ini"
						},
						{
							label: "默认（自动测速）",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_AdblockPlus.ini"
						},
						{
							label: "默认（索尼电视专用）",
							value: "https://raw.githubusercontent.com/youshandefeiyang/webcdn/main/SONY.ini"
						},
						{
							label: "默认（附带用于 Clash 的 AdGuard DNS）",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/default_with_clash_adg.yml"
						},
						{
							label: "ACL_全分组 Dream修改版",
							value: "https://raw.githubusercontent.com/WC-Dream/ACL4SSR/WD/Clash/config/ACL4SSR_Online_Full_Dream.ini"
						},
						{
							label: "ACL_精简分组 Dream修改版",
							value: "https://raw.githubusercontent.com/WC-Dream/ACL4SSR/WD/Clash/config/ACL4SSR_Mini_Dream.ini"
						},
						{
							label: "emby-TikTok-流媒体分组-去广告加强版",
							value: "https://raw.githubusercontent.com/justdoiting/ClashRule/main/GeneralClashRule.ini"
						},
						{
							label: "流媒体通用分组",
							value: "https://raw.githubusercontent.com/cutethotw/ClashRule/main/GeneralClashRule.ini"
						}]
					},
					{
						label: "自用",
						options: [{
							label: "默认",
							value: "https://raw.githubusercontent.com/xuanlv1998/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini"
						},
						{
							label: "默认（自动测速）",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_AdblockPlus.ini"
						}]
					},
					{
						label: "ACL规则",
						options: [{
							label: "ACL_默认版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online.ini"
						},
						{
							label: "ACL_无测速版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoAuto.ini"
						},
						{
							label: "ACL_去广告版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_AdblockPlus.ini"
						},
						{
							label: "ACL_多国家版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_MultiCountry.ini"
						},
						{
							label: "ACL_无Reject版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_NoReject.ini"
						},
						{
							label: "ACL_无测速精简版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_NoAuto.ini"
						},
						{
							label: "ACL_全分组版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full.ini"
						},
						{
							label: "ACL_全分组谷歌版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Google.ini"
						},
						{
							label: "ACL_全分组多模式版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_MultiMode.ini"
						},
						{
							label: "ACL_全分组奈飞版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Full_Netflix.ini"
						},
						{
							label: "ACL_精简版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini.ini"
						},
						{
							label: "ACL_去广告精简版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_AdblockPlus.ini"
						},
						{
							label: "ACL_Fallback精简版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_Fallback.ini"
						},
						{
							label: "ACL_多国家精简版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiCountry.ini"
						},
						{
							label: "ACL_多模式精简版",
							value: "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/config/ACL4SSR_Online_Mini_MultiMode.ini"
						}]
					},
					{
						label: "全网搜集规则",
						options: [{
							label: "常规规则",
							value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG.ini"
						},
						{
							label: "酷酷自用",
							value: "https://raw.githubusercontent.com/xiaoshenxian233/cool/rule/complex.ini"
						},
						{
							label: "PharosPro无测速",
							value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/special/phaors.ini"
						},
						{
							label: "分区域故障转移",
							value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_Fallback.ini"
						},
						{
							label: "分区域自动测速",
							value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_Urltest.ini"
						},
						{
							label: "分区域无自动测速",
							value: "https://raw.githubusercontent.com/flyhigherpi/merlinclash_clash_related/master/Rule_config/ZHANG_Area_NoAuto.ini"
						},
						{
							label: "OoHHHHHHH",
							value: "https://raw.githubusercontent.com/OoHHHHHHH/ini/master/config.ini"
						},
						{
							label: "CFW-TAP",
							value: "https://raw.githubusercontent.com/OoHHHHHHH/ini/master/cfw-tap.ini"
						},
						{
							label: "lhl77全分组（定期更新）",
							value: "https://raw.githubusercontent.com/lhl77/sub-ini/main/tsutsu-full.ini"
						},
						{
							label: "lhl77简易版（定期更新）",
							value: "https://raw.githubusercontent.com/lhl77/sub-ini/main/tsutsu-mini-gfw.ini"
						},
						{
							label: "ConnersHua 神机规则 Outbound",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/connershua_new.ini"
						},
						{
							label: "ConnersHua 神机规则 Inbound 回国专用",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/connershua_backtocn.ini"
						},
						{
							label: "lhie1 洞主规则（使用 Clash 分组规则）",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/lhie1_clash.ini"
						},
						{
							label: "lhie1 洞主规则完整版",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/lhie1_dler.ini"
						},
						{
							label: "eHpo1 规则",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/ehpo1_main.ini"
						},
						{
							label: "多策略组默认白名单模式",
							value: "https://raw.nameless13.com/api/public/dl/ROzQqi2S/white.ini"
						},
						{
							label: "多策略组可以有效减少审计触发",
							value: "https://raw.nameless13.com/api/public/dl/ptLeiO3S/mayinggfw.ini"
						},
						{
							label: "精简策略默认白名单",
							value: "https://raw.nameless13.com/api/public/dl/FWSh3dXz/easy3.ini"
						},
						{
							label: "多策略增加SMTP策略",
							value: "https://raw.nameless13.com/api/public/dl/L_-vxO7I/youtube.ini"
						},
						{
							label: "无策略入门推荐",
							value: "https://raw.nameless13.com/api/public/dl/zKF9vFbb/easy.ini"
						},
						{
							label: "无策略入门推荐国家分组",
							value: "https://raw.nameless13.com/api/public/dl/E69bzCaE/easy2.ini"
						},
						{
							label: "无策略仅IPIP CN + Final",
							value: "https://raw.nameless13.com/api/public/dl/XHr0miMg/ipip.ini"
						},
						{
							label: "无策略魅影vip分组",
							value: "https://raw.nameless13.com/api/public/dl/BBnfb5lD/MAYINGVIP.ini"
						},
						{
							label: "品云专属配置（仅香港区域分组）",
							value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Examine.ini"
						},
						{
							label: "品云专属配置（全地域分组）",
							value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Examine_Full.ini"
						},
						{
							label: "nzw9314 规则",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/nzw9314_custom.ini"
						},
						{
							label: "maicoo-l 规则",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/maicoo-l_custom.ini"
						},
						{
							label: "DlerCloud Platinum 李哥定制规则",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_platinum.ini"
						},
						{
							label: "DlerCloud Gold 李哥定制规则",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_gold.ini"
						},
						{
							label: "DlerCloud Silver 李哥定制规则",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/dlercloud_lige_silver.ini"
						},
						{
							label: "ProxyStorage自用",
							value: "https://unpkg.com/proxy-script/config/Clash/clash.ini"
						},
						{
							label: "ShellClash修改版规则 (by UlinoyaPed)",
							value: "https://github.com/UlinoyaPed/ShellClash/raw/master/rules/ShellClash.ini"
						}]
					},
					{
						label: "各大机场规则",
						options: [{
							label: "EXFLUX",
							value: "https://gist.github.com/jklolixxs/16964c46bad1821c70fa97109fd6faa2/raw/EXFLUX.ini"
						},
						{
							label: "NaNoport",
							value: "https://gist.github.com/jklolixxs/32d4e9a1a5d18a92beccf3be434f7966/raw/NaNoport.ini"
						},
						{
							label: "CordCloud",
							value: "https://gist.github.com/jklolixxs/dfbe0cf71ffc547557395c772836d9a8/raw/CordCloud.ini"
						},
						{
							label: "BigAirport",
							value: "https://gist.github.com/jklolixxs/e2b0105c8be6023f3941816509a4c453/raw/BigAirport.ini"
						},
						{
							label: "跑路云",
							value: "https://gist.github.com/jklolixxs/9f6989137a2cfcc138c6da4bd4e4cbfc/raw/PaoLuCloud.ini"
						},
						{
							label: "WaveCloud",
							value: "https://gist.github.com/jklolixxs/fccb74b6c0018b3ad7b9ed6d327035b3/raw/WaveCloud.ini"
						},
						{
							label: "几鸡",
							value: "https://gist.github.com/jklolixxs/bfd5061dceeef85e84401482f5c92e42/raw/JiJi.ini"
						},
						{
							label: "四季加速",
							value: "https://gist.github.com/jklolixxs/6ff6e7658033e9b535e24ade072cf374/raw/SJ.ini"
						},
						{
							label: "ImmTelecom",
							value: "https://gist.github.com/jklolixxs/24f4f58bb646ee2c625803eb916fe36d/raw/ImmTelecom.ini"
						},
						{
							label: "AmyTelecom",
							value: "https://gist.github.com/jklolixxs/b53d315cd1cede23af83322c26ce34ec/raw/AmyTelecom.ini"
						},
						{
							label: "LinkCube",
							value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/convenience.ini"
						},
						{
							label: "Miaona",
							value: "https://gist.github.com/jklolixxs/ff8ddbf2526cafa568d064006a7008e7/raw/Miaona.ini"
						},
						{
							label: "Foo&Friends",
							value: "https://gist.github.com/jklolixxs/df8fda1aa225db44e70c8ac0978a3da4/raw/Foo&Friends.ini"
						},
						{
							label: "ABCloud",
							value: "https://gist.github.com/jklolixxs/b1f91606165b1df82e5481b08fd02e00/raw/ABCloud.ini"
						},
						{
							label: "咸鱼",
							value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/xianyu.ini"
						},
						{
							label: "便利店",
							value: "https://subweb.oss-cn-hongkong.aliyuncs.com/RemoteConfig/customized/convenience.ini"
						},
						{
							label: "CNIX",
							value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/SSRcloud.ini"
						},
						{
							label: "Nirvana",
							value: "https://raw.githubusercontent.com/Mazetsz/ACL4SSR/master/Clash/config/V2rayPro.ini"
						},
						{
							label: "V2Pro",
							value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/V2Pro.ini"
						},
						{
							label: "史迪仔-自动测速",
							value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Stitch.ini"
						},
						{
							label: "史迪仔-负载均衡",
							value: "https://raw.githubusercontent.com/Mazeorz/airports/master/Clash/Stitch-Balance.ini"
						},
						{
							label: "Maying",
							value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/maying.ini"
						},
						{
							label: "Ytoo",
							value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/ytoo.ini"
						},
						{
							label: "w8ves",
							value: "https://raw.nameless13.com/api/public/dl/M-We_Fn7/w8ves.ini"
						},
						{
							label: "NyanCAT",
							value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/nyancat.ini"
						},
						{
							label: "Nexitally",
							value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/nexitally.ini"
						},
						{
							label: "SoCloud",
							value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/socloud.ini"
						},
						{
							label: "ARK",
							value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/customized/ark.ini"
						},
						{
							label: "N3RO",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/n3ro_optimized.ini"
						},
						{
							label: "Scholar",
							value: "https://gist.githubusercontent.com/tindy2013/1fa08640a9088ac8652dbd40c5d2715b/raw/scholar_optimized.ini"
						},
						{
							label: "Flowercloud",
							value: "https://subweb.s3.fr-par.scw.cloud/RemoteConfig/customized/flower.ini"
						}]
					},
					{
						label: "特殊",
						options: [{
							label: "NeteaseUnblock",
							value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/special/netease.ini"
						},
						{
							label: "Basic",
							value: "https://raw.githubusercontent.com/SleepyHeeead/subconverter-config/master/remote-config/special/basic.ini"
						}]
					}]
				},
				form: {
					sourceSubUrl: "",
					clientType: "",
					customBackend: "",
					remoteConfig: "",
					excludeRemarks: "",
					includeRemarks: "",
					filename: "",
					emoji: true,
					nodeList: false,
					extraset: false,
					sort: false,
					udp: false,
					tfo: false,
					scv: true,
					fdn: false,
					appendType: false,
					insert: false,
					// 是否插入默认订阅的节点，对应配置项 insert_url
					new_name: true,
					// 是否使用 Clash 新字段
					// tpl 定制功能
					tpl: {
						surge: {
							doh: false // dns 查询是否使用 DoH
						},
						clash: {
							doh: false
						}
					}
				},

				loading: false,
				customSubUrl: "",
				curtomShortSubUrl: "",

				dialogUploadConfigVisible: false,
				loadConfig: "",
				dialogLoadConfigVisible: false,
				uploadConfig: "",
				uploadPassword: "",
				myBot: tgBotLink,
				sampleConfig: remoteConfigSample,

				needUdp: false,
				// 是否需要添加 udp 参数
			};
		},
		created() {
			document.title = "Subscription Converter";
			this.isPC = this.$getOS().isPc;

			// 获取 url cache
			if (process.env.VUE_APP_USE_STORAGE === 'true') {
				this.form.sourceSubUrl = this.getLocalStorageItem('sourceSubUrl')
			}
		},
		mounted() {
			this.form.clientType = "clash";
			this.notify();
			this.getBackendVersion();
		},
		methods: {
			onCopy() {
				this.$message.success("Copied!");
			},
			goToProject() {
				window.open(project);
			},
			gotoGayhub() {
				window.open(gayhubRelease);
			},
			gotoRemoteConfig() {
				window.open(remoteConfigSample);
			},
			clashInstall() {
				if (this.customSubUrl === "") {
					this.$message.error("请先填写必填项，生成订阅链接");
					return false;
				}

				const url = "clash://install-config?url=";
				window.open(url + encodeURIComponent(this.curtomShortSubUrl !== "" ? this.curtomShortSubUrl: this.customSubUrl));
			},
			surgeInstall() {
				if (this.customSubUrl === "") {
					this.$message.error("请先填写必填项，生成订阅链接");
					return false;
				}

				const url = "surge://install-config?url=";
				window.open(url + this.customSubUrl);
			},
			makeUrl() {
				if (this.form.sourceSubUrl === "" || this.form.clientType === "") {
					this.$message.error("订阅链接与客户端为必填项");
					return false;
				}

				let backend = this.form.customBackend === "" ? defaultBackend: this.form.customBackend;

				let sourceSub = this.form.sourceSubUrl;
				sourceSub = sourceSub.replace(/(\n|\r|\n\r)/g, "|");

				this.customSubUrl = backend + "target=" + this.form.clientType + "&url=" + encodeURIComponent(sourceSub) + "&insert=" + this.form.insert;

				if (this.advanced === "2") {
					if (this.form.remoteConfig !== "") {
						this.customSubUrl += "&config=" + encodeURIComponent(this.form.remoteConfig);
					}
					if (this.form.excludeRemarks !== "") {
						this.customSubUrl += "&exclude=" + encodeURIComponent(this.form.excludeRemarks);
					}
					if (this.form.includeRemarks !== "") {
						this.customSubUrl += "&include=" + encodeURIComponent(this.form.includeRemarks);
					}
					if (this.form.filename !== "") {
						this.customSubUrl += "&filename=" + encodeURIComponent(this.form.filename);
					}
					if (this.form.appendType) {
						this.customSubUrl += "&append_type=" + this.form.appendType.toString();
					}

					this.customSubUrl += "&emoji=" + this.form.emoji.toString() + "&list=" + this.form.nodeList.toString() + "&tfo=" + this.form.tfo.toString() + "&scv=" + this.form.scv.toString() + "&fdn=" + this.form.fdn.toString() + "&sort=" + this.form.sort.toString();

					if (this.needUdp) {
						this.customSubUrl += "&udp=" + this.form.udp.toString()
					}

					if (this.form.tpl.surge.doh === true) {
						this.customSubUrl += "&surge.doh=true";
					}

					if (this.form.clientType === "clash") {
						if (this.form.tpl.clash.doh === true) {
							this.customSubUrl += "&clash.doh=true";
						}

						this.customSubUrl += "&new_name=" + this.form.new_name.toString();
					}
				}

				this.$copyText(this.customSubUrl);
				this.$message.success("定制订阅已复制到剪贴板");
			},
			makeShortUrl() {
				if (this.customSubUrl === "") {
					this.$message.warning("请先生成订阅链接，再获取对应短链接");
					return false;
				}

				this.loading = true;

				let data = new FormData();
				data.append("longUrl", btoa(this.customSubUrl));

				this.$axios.post(shortUrlBackend, data, {
					header: {
						"Content-Type": "application/form-data; charset=utf-8"
					}
				}).then(res = >{
					if (res.data.Code === 1 && res.data.ShortUrl !== "") {
						this.curtomShortSubUrl = res.data.ShortUrl;
						this.$copyText(res.data.ShortUrl);
						this.$message.success("短链接已复制到剪贴板");
					} else {
						this.$message.error("短链接获取失败：" + res.data.Message);
					}
				}).
				catch(() = >{
					this.$message.error("短链接获取失败");
				}).
				finally(() = >{
					this.loading = false;
				});
			},
			notify() {
				const h = this.$createElement;

				this.$notify({
					title: "隐私提示",
					type: "warning",
					message: h("i", {
						style: "color: teal"
					},
					"各种订阅链接（短链接服务除外）生成纯前端实现，无隐私问题。默认提供后端转换服务，隐私担忧者请自行搭建后端服务。")
				});
			},
			confirmUploadConfig() {
				if (this.uploadConfig === "") {
					this.$message.warning("远程配置不能为空");
					return false;
				}

				this.loading = true;

				let body = {
					content: this.uploadConfig,
				}
				this.$axios.post(configUploadBackend, body).then(res = >{
					if (res.data.code === 0 && res.data.data.url !== "") {
						this.$message.success("远程配置上传成功，配置链接已复制到剪贴板，有效期三个月望知悉");

						// 自动填充至『表单-远程配置』
						this.form.remoteConfig = res.data.data.url;
						this.$copyText(this.form.remoteConfig);

						this.dialogUploadConfigVisible = false;
					} else {
						this.$message.error("远程配置上传失败: " + res.data.msg);
					}
				}).
				catch(() = >{
					this.$message.error("远程配置上传失败");
				}).
				finally(() = >{
					this.loading = false;
				});
			},
			/**
 * Asynchronously analyzes the URL.
 *
 * @return {Promise<string>} The result of the analysis.
 */
			async analyzeUrl() {
				// Check if `loadConfig` includes "target"
				if (this.loadConfig.includes("target")) {
					// If it does, return `loadConfig`
					return this.loadConfig;
				} else {
					// Otherwise, set `loading` to true
					this.loading = true;
					try {
						// Fetch the data from `loadConfig` using GET method and follow redirects
						let response = await fetch(this.loadConfig, {
							method: "GET",
							redirect: "follow",
						});
						// Return the URL from the response
						return response.url;
					} catch(e) {
						// If an error occurs, display an error message with the error details
						this.$message.error("解析短链接失败，请检查短链接服务端是否配置跨域：" + e);
					} finally {
						// Set `loading` to false
						this.loading = false;
					}
				}
			},
			/**
     * Confirm and load the configuration.
     *
     * @return {boolean} Returns false if the 'loadConfig' is empty, otherwise returns true.
     */
			confirmLoadConfig() {
				// Check if 'loadConfig' is empty
				if (this.loadConfig.trim() === "") {
					// Display error message if 'loadConfig' is empty
					this.$message.error("订阅链接不能为空");
					return false;
				}

				// Async function to handle the configuration loading
				(async() = >{
					try {
						// Analyze the URL and extract its components
						const url = new URL(await this.analyzeUrl());

						// Set the custom backend URL
						this.form.customBackend = url.origin + url.pathname + "?";

						// Parse the URL parameters
						const params = new URLSearchParams(url.search);

						// Get the 'target' parameter
						const target = params.get("target");

						// Set the client type based on the 'target' parameter
						if (target === "surge") {
							const ver = params.get("ver") || "4";
							this.form.clientType = target + "&ver=" + ver;
						} else {
							this.form.clientType = target;
						}

						// Set other form properties based on the URL parameters
						this.form.sourceSubUrl = params.get("url");
						this.form.insert = params.get("insert") === "true";
						this.form.remoteConfig = params.get("config");
						this.form.excludeRemarks = params.get("exclude");
						this.form.includeRemarks = params.get("include");
						this.form.filename = params.get("filename");
						this.form.appendType = params.get("append_type") === "true";
						this.form.emoji = params.get("emoji") === "true";
						this.form.nodeList = params.get("list") === "true";
						this.form.tfo = params.get("tfo") === "true";
						this.form.scv = params.get("scv") === "true";
						this.form.fdn = params.get("fdn") === "true";
						this.form.sort = params.get("sort") === "true";
						this.form.udp = params.get("udp") === "true";
						this.form.tpl.surge.doh = params.get("surge.doh") === "true";
						this.form.tpl.clash.doh = params.get("clash.doh") === "true";
						this.form.new_name = params.get("new_name") === "true";

						// Hide the configuration dialog
						this.dialogLoadConfigVisible = false;

						// Display success message
						this.$message.success("长/短链接已成功解析为订阅信息");
					} catch(error) {
						// Display error message if URL is not valid
						this.$message.error("请输入正确的订阅地址!");
					}
				})();
			},
			backendSearch(queryString, cb) {
				let backends = this.options.backendOptions;

				let results = queryString ? backends.filter(this.createFilter(queryString)) : backends;

				// 调用 callback 返回建议列表的数据
				cb(results);
			},
			createFilter(queryString) {
				return candidate = >{
					return (candidate.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
				};
			},
			getBackendVersion() {
				this.$axios.get(defaultBackend.substring(0, defaultBackend.length - 5) + "/version").then(res = >{
					this.backendVersion = res.data.replace(/backend\n$/gm, "");
					this.backendVersion = this.backendVersion.replace("subconverter", "");
				});
			},
			saveSubUrl() {
				if (this.form.sourceSubUrl !== '') {
					this.setLocalStorageItem('sourceSubUrl', this.form.sourceSubUrl)
				}
			},
			getLocalStorageItem(itemKey) {
				const now = +new Date() let ls = localStorage.getItem(itemKey)

				let itemValue = ''
				if (ls !== null) {
					let data = JSON.parse(ls) if (data.expire > now) {
						itemValue = data.value
					} else {
						localStorage.removeItem(itemKey)
					}
				}

				return itemValue
			},
			setLocalStorageItem(itemKey, itemValue) {
				const ttl = process.env.VUE_APP_CACHE_TTL const now = +new Date()

				let data = {
					setTime: now,
					ttl: parseInt(ttl),
					expire: now + ttl * 1000,
					value: itemValue
				}
				localStorage.setItem(itemKey, JSON.stringify(data))
			}
		},
	};
</script>
