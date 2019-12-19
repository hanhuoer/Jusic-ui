<template>
    <div>
        <div v-if="isPlay">
            <navigation></navigation>
            <mu-container class="demo-container">
                <mu-row></mu-row>
                <mu-row gutter>
                    <mu-col span="12" sm="12" md="8" lg="8" xl="9">
                        <mu-col span="12">
                            <mu-row>
                                <mu-col span="12" sm="12" md="5" lg="4" xl="3"
                                        style="text-align: center; padding: 0 0 50px 0;">
                                    <mu-avatar :size="albumRotateSize"
                                               style="border: 2px solid rgba(26, 26, 26, 0.5); overflow: hidden; box-shadow: inset 0 0 20px 2px #000;">
                                        <img :class="albumRotate ? 'album album-rotate' : 'album'"
                                             :src="music.pictureUrl ? music.pictureUrl : require('../assets/images/logo.png')"
                                             :style="albumRotateStyle"
                                             alt="pic">
                                    </mu-avatar>
                                </mu-col>
                                <mu-col span="12" sm="12" md="7" lg="8" xl="9">
                                    <div style="font-size: 24px; font-weight: 400; margin: 4px 0 10px 0; min-height: 31px;">
                                        {{music ? music.name : ''}}
                                    </div>
                                    <div style="font-size: 16px; font-weight: 400; margin: 10px 0; min-height: 21px;">
                                        专辑: &nbsp;{{music.album ? '《' + music.album.name + '》' : ''}}
                                        歌手: &nbsp;{{music ? music.artist : ''}}
                                    </div>

                                    <div style="font-size: 14px; font-weight: 400; margin: 50px 0 10px 0; min-height: 21px;">
                                        {{lyric}}
                                    </div>
                                    <small id="musicEndTime" style="float: right">{{playerTime}}</small>
                                    <mu-linear-progress mode="determinate" :value="progress"
                                                        color="#009688"></mu-linear-progress>
                                    <mu-slider class="demo-slider" color="#009688" v-model="volume"
                                               style="color: rgb(0, 150, 136);"></mu-slider>
                                </mu-col>
                            </mu-row>
                        </mu-col>
                        <mu-col span="12">
                            <mu-data-table style="background-color: transparent" :selectable="false" :hover="false"
                                           :columns="columns" :data="pick">
                                <template slot-scope="scope">
                                    <td class="is-left">{{isRoot||isAdmin? scope.row.name + `[${scope.row.id}]`:
                                        scope.row.name}}
                                    </td>
                                    <td class="is-center">{{scope.row.artist}}</td>
                                    <td class="is-center">{{'《' + scope.row.album.name+'》'}}</td>
                                    <td class="is-center">{{scope.row.nickName}}</td>
                                </template>
                            </mu-data-table>
                        </mu-col>
                    </mu-col>
                    <mu-col span="12" sm="12" md="4" lg="4" xl="3">
                        <mu-col :style="screenWidth < 766 && screenWidth !== 0 ? 'margin: 100px 0 0 0;': ''">
                            <div style="font-size: 24px; font-weight: 400; margin: 4px 0 10px 0; min-height: 31px;">
                                实时聊天
                            </div>
                            <div style="font-size: 16px; font-weight: 400;">在线人数: {{online}}</div>
                            <div id="chat-container">
                                <div v-for="(item, index) in chatData"
                                     :style="item.type==='notice'?'text-align: center':''" style="padding: 10px 0">
                                    <div>
                                        <small class="chat-data-user">{{(isRoot||isAdmin) && item.type==='chat'?
                                            item.nickName + `[${item.sessionId}]`: item.nickName}}</small>
                                    </div>
                                    <div>
                                        <span :class="item.type==='notice'?'chat-data-notice':'chat-data-content'">{{item.content}}</span>
                                    </div>
                                </div>
                            </div>
                            <div :class="screenWidth < 766 && screenWidth !== 0 ? 'message-input-group': ''">
                                <mu-text-field :value="chatMessage"
                                               @input="updateChatMessage"
                                               @keydown.enter="sendHandler"
                                               placeholder="Message..."
                                               color="primary"
                                               class="width-size-100 chat-message"></mu-text-field>
                                <br/>
                                <mu-button v-if="!isContented" @click="connect" color="primary" style="width: 100%">
                                    连接服务器
                                </mu-button>
                                <mu-button v-if="isContented" @click="sendHandler" color="primary" style="width: 100%">
                                    发送消息
                                </mu-button>
                            </div>
                        </mu-col>
                        <mu-col style="margin-bottom: 160px">
                            <div class="chat-quick-bar">
                                <span @click="musicSkipVote">[投票切歌]</span>
                                <span @click="musicSkipVote">&nbsp;&nbsp;[投票切歌]&nbsp;&nbsp;</span>
                                <span @click="musicSkipVote">[投票切歌]</span>
                            </div>
                            <p>提示：输入 “点歌 歌名” 即可点歌。</p>
                            <p>例如：点歌 春夏秋冬</p>
                            <p>支持输入网易云音乐 ID 点歌</p>
                            <br/>
                            <p>如遇不好听的歌可以输入 “投票切歌” 或者点击 “[投票切歌]”，当投票人数大于在线人数 30% 时将会切歌。</p>
                            <br/>
                            <p>输入 “设置昵称 名字” 可以设置自己的显示昵称，仅限当前客户端有效。</p>
                        </mu-col>
                    </mu-col>
                </mu-row>
            </mu-container>
            <div id="blur" style="opacity: 20%;">
                <img :src="music.pictureUrl" alt="blur-img">
            </div>
            <div>
                <audio id="music" :src="music.url" @timeupdate="musicTimeUpdate" controls="" autoplay="autoplay"
                       style="display: none"></audio>
            </div>
        </div>
        <div id="play" v-if="!isPlay" style="position: fixed; width: 100%; height:100%">
            <mu-icon @click="play" value="play_circle_filled" color="primary" size="150"
                     style="position: fixed; top: calc(50% - 75px); left: calc(50% - 75px); cursor: pointer;"></mu-icon>
        </div>
    </div>
</template>

<script>

    import {mapGetters, mapMutations} from 'vuex'
    import SockJS from 'sockjs-client'
    import Stomp from 'stompjs'
    import {sendUtils, messageUtils, timeUtils, musicUtils} from '../utils'
    import {baseUrl, isProduction} from "../config/environment";
    import Navigation from '../components/Navigation'

    export default {
        name: "Music",
        components: {
            Navigation
        },
        computed: {
            ...mapGetters({
                isContented: 'getIsConnected',
                online: 'getSocketOnline',
                chatMessage: 'getChatMessage',
                chatData: 'getChatData',
                music: 'getPlayerMusic',
                progress: 'getPlayerProgress',
                playerTime: 'getPlayerTime',
                // volume: 'getPlayerVolume',
                pick: 'getPlayerPick',
                lyric: 'getPlayerLyric',
                isRoot: 'isSocketRoot',
                isAdmin: 'isSocketAdmin'
            }),
            ...mapMutations({
                // volume: 'setPlayerVolume'
            }),
            volume: {
                get: function () {
                    return this.$store.getters.getPlayerVolume;
                },
                set: function (value) {
                    music.volume = Number(value) / 100;
                    this.$store.commit('setPlayerVolume', value);
                }
            }
        },
        data: () => ({
            isPlay: false,
            columns: [
                {title: '歌曲', name: 'name', width: 200, align: 'center'},
                {title: '歌手', name: 'calories', align: 'center', sortable: true},
                {title: '专辑', name: 'fat', align: 'center', sortable: true},
                {title: '点歌人', name: 'carbs', align: 'center', sortable: true},
            ],
            albumRotate: false,
            screenWidth: document.documentElement.clientWidth,
            albumRotateSize: 300,
            albumRotateStyle: ''
        }),
        methods: {
            play: function () {
                this.getScreenWidth();
                this.isPlay = !this.isPlay;
                this.connect();
            },
            connect: function () {
                let _this = this;
                let socketClient = this.$store.getters.getSocketClient;
                let stompClient = this.$store.getters.getStompClient;

                socketClient = new SockJS(baseUrl + '/server');
                stompClient = Stomp.over(socketClient);

                stompClient.debug = () => {};
                stompClient.connect({}, (frame) => {

                    // console.log('连接到服务器成功！', frame);
                    this.$store.commit('setSocketIsConnected', true);

                    let afterOnMessage = socketClient.onmessage;
                    socketClient.onmessage = function (message) {
                        _this.messageHandler(message);
                        afterOnMessage(message);
                    };

                    let userName = window.localStorage.getItem('USER_NAME');
                    if (userName) {
                        this.settingName(userName);
                    }

                    this.subscribe();

                }, (error) => {
                    // console.log('连接到服务器失败！', error);
                });

                this.saveSocket(socketClient, stompClient);
            },
            close: function () {
                let socketClient = this.$store.getters.getSocketClient;
                let stompClient = this.$store.getters.getStompClient;

                stompClient.disconnect();
                socketClient.close();

                this.saveSocket(socketClient, stompClient);
            },
            subscribe: function () {
                let stompClient = this.$store.getters.getStompClient;

                stompClient.subscribe('/topic/chat', (response) => {
                    // console.log('来自 /topic/chat 频道的消息', response);
                    this.$store.commit('pushChatData', JSON.parse(response.body).data)
                });

                stompClient.subscribe('/topic/music/order', (response) => {
                    // console.log('来自 /topic/music/order 频道的消息', response);
                });

                this.saveSocket(null, stompClient);
            },
            saveSocket: function (socketClient, stompClient) {
                if (socketClient !== null) {
                    this.$store.commit('setSocketClient', socketClient);
                }
                if (stompClient !== null) {
                    this.$store.commit('setStompClient', stompClient);
                }
            },
            sendHandler: function () {
                // console.log('消息发送处理器');
                let stompClient = this.$store.getters.getStompClient;
                let chatMessage = this.$store.getters.getChatMessage;

                let instruction = sendUtils.parseInstruction(chatMessage);
                let content = '';

                switch (instruction) {
                    case '点歌':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入音乐关键词', chatMessage)
                        } else {
                            stompClient.send('/music/pick', {}, JSON.stringify({
                                name: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    case '投票切歌':
                        this.musicSkipVote();
                        break;
                    case '设置昵称':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入昵称', chatMessage)
                        } else {
                            this.settingName(content);
                        }
                        break;
                    case 'root':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入 root 密码', chatMessage)
                        } else {
                            stompClient.send('/auth/root', {}, JSON.stringify({
                                password: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    case 'admin':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入 admin 密码', chatMessage)
                        } else {
                            stompClient.send('/auth/admin', {}, JSON.stringify({
                                password: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    case '置顶音乐':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入要置顶的音乐', chatMessage)
                        } else {
                            stompClient.send('/music/top', {}, JSON.stringify({
                                name: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    case '删除音乐':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入要删除的音乐', chatMessage)
                        } else {
                            stompClient.send('/music/delete', {}, JSON.stringify({
                                name: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    case '拉黑用户':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入要拉黑的用户 session', chatMessage)
                        } else {
                            stompClient.send('/chat/black', {}, JSON.stringify({
                                sessionId: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    case '漂白用户':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入要漂白的用户 session', chatMessage)
                        } else {
                            stompClient.send('/chat/unblack', {}, JSON.stringify({
                                sessionId: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    case '拉黑音乐':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                            // console.log('请输入要拉黑的音乐 id', chatMessage);
                        } else {
                            stompClient.send('/music/black', {}, JSON.stringify({
                                id: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    case '漂白音乐':
                        content = sendUtils.parseContent(instruction, chatMessage);
                        if (content === '') {
                        } else {
                            // console.log('请输入要漂白的音乐 id', chatMessage);
                            stompClient.send('/music/unblack', {}, JSON.stringify({
                                id: content,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                    default:
                        if (chatMessage === null || chatMessage === '' || chatMessage.length === 0) {
                            // console.log('消息非法', chatMessage);
                        } else {
                            stompClient.send('/chat', {}, JSON.stringify({
                                content: chatMessage,
                                sendTime: Date.now()
                            }));
                        }
                        break;
                }

                this.$store.commit('setChatMessage', '');
            },
            messageHandler: function (source) {
                // console.log('消息处理器收到消息', source);
                if (messageUtils.isKnowMessageType(source.data)) {
                    let messageType = messageUtils.parseMessageType(source.data);
                    let messageContent = messageUtils.parseMessageContent(source.data);
                    switch (messageType) {
                        case messageUtils.messageType.ONLINE:
                            if (messageContent.data.count !== undefined
                                && typeof (messageContent.data.count) !== 'undefined'
                                && messageContent.data.count !== null
                                && messageContent.data.count !== '') {
                                this.$store.commit('setSocketOnline', messageContent.data.count);
                            }
                            break;
                        case messageUtils.messageType.NOTICE:
                            if (messageContent.message !== undefined
                                && typeof (messageContent.message) !== 'undefined'
                                && messageContent.message !== null
                                && messageContent.message !== '') {
                                this.$store.commit('pushChatData', {
                                    content: messageContent.message,
                                    type: 'notice'
                                });
                            }
                            break;
                        case messageUtils.messageType.CHAT:
                            this.$store.commit('pushChatData', messageContent.data);
                            break;
                        case messageUtils.messageType.PICK:
                            this.$store.commit('setPlayerPick', messageContent.data);
                            break;
                        case messageUtils.messageType.MUSIC:
                            this.$store.commit('setPlayerMusic', messageContent.data);
                            this.$store.commit('setPlayerLyrics', musicUtils.parseLyric(messageContent.data.lyric));
                            break;
                        case messageUtils.messageType.AUTH_ROOT:
                            this.$store.commit('pushChatData', {
                                content: messageContent.message,
                                type: 'notice'
                            });
                            if (Number(messageContent.code) === 20000) {
                                this.$store.commit('setSocketRoot', true);
                                // console.log('root success')
                            }
                            break;
                        case messageUtils.messageType.AUTH_ADMIN:
                            this.$store.commit('pushChatData', {
                                content: messageContent.message,
                                type: 'notice'
                            });
                            if (Number(messageContent.code) === 20000) {
                                this.$store.commit('setSocketAdmin', true);
                                // console.log('admin success')
                            }
                            break;
                        case messageUtils.messageType.SETTING_NAME:
                            this.$store.commit('pushChatData', {
                                content: messageContent.message,
                                type: 'notice'
                            });
                            this.$store.commit('setSocketUserName', messageContent.data.name);
                            break;
                        default:
                            // console.log('未知消息类型', messageType, source);
                            break;
                    }
                }
            },
            updateChatMessage: function (value) {
                this.$store.commit('setChatMessage', value);
            },
            settingName: function (name) {
                let stompClient = this.$store.getters.getStompClient;
                stompClient.send('/setting/name', {}, JSON.stringify({
                    name: name,
                    sendTime: Date.now()
                }));
            },
            musicSkipVote: function () {
                let stompClient = this.$store.getters.getStompClient;
                stompClient.send('/music/skip/vote', {}, {});
            },
            musicTimeUpdate: function (e) {
                // progress
                let currentTime = e.target.currentTime;
                let duration = e.target.duration;
                this.$store.commit('setPlayerProgress', (currentTime / duration) * 100);

                // show time
                let usedTimeHH_mm_ss = timeUtils.secondsToHH_mm_ss(currentTime);
                let durationHH_mm_ss = timeUtils.secondsToHH_mm_ss(duration);
                let time = usedTimeHH_mm_ss + ' / ' + durationHH_mm_ss;
                this.$store.commit('setPlayerTime', time);

                // lyric
                let lyrics = this.$store.getters.getPlayerLyrics;
                let number = Number(currentTime.toFixed());
                if (lyrics[number] !== undefined && lyrics[number] !== '') {
                    this.$store.commit('setPlayerLyric', lyrics[number]);
                }
            },
            getScreenWidth: function () {
                const _this = this;
                window.onresize = () => {
                    return (() => {
                        _this.screenWidth = document.documentElement.clientWidth;
                    })()
                };
            }
        },
        watch: {
            '$store.state.player.music': function (newValue, oldValue) {
                let _this = this;
                this.albumRotate = false;
                document.querySelector('#music').volume = Number(this.$store.getters.getPlayerVolume) / 100;
                // 解决部分移动端不能自动播放
                document.addEventListener('touchstart', function () {
                    document.querySelector('#music').play();
                });
                setTimeout(function () {
                    _this.albumRotate = true;
                    document.querySelector('#music').currentTime = (Date.now() - newValue.pushTime) / 1000;
                }, 1000)
            },
            '$store.state.chat.data': function (newValue, oldValue) {
                setTimeout(function () {
                    let chat = document.querySelector('#chat-container');
                    chat.scrollTop = chat.scrollHeight;
                }, 10)
            },
            screenWidth(val) {
                //监控浏览器高度变化
                if (!this.timer) {
                    this.screenWidth = val;
                    this.timer = true;
                    let _this = this;
                    setTimeout(function () {
                        _this.timer = false
                    }, 400)
                }
                if (val <= 766) {
                    this.albumRotateSize = 450;
                    this.albumRotateStyle = 'border:70px solid rgb(12, 12, 12); padding: 8px;';
                }
                if (val > 766 && val < 1000) {
                    this.albumRotateSize = 160;
                    this.albumRotateStyle = 'border:32px solid rgb(12, 12, 12); padding: 4px;';
                }
                if (val >= 1000) {
                    this.albumRotateSize = 200;
                    this.albumRotateStyle = 'border:40px solid rgb(12, 12, 12); padding: 4px;';
                }
            }
        },
        mounted() {
            this.getScreenWidth()
        },
        created() {
            // let val = this.albumRotateSize;
            let val = document.documentElement.clientWidth;
            // console.log(val);

            if (val <= 700) {
                this.albumRotateSize = val - 60;
                this.albumRotateStyle = `border:${Math.floor(val / 10) + 10}px solid rgb(12, 12, 12);`;
            }
            if (val > 700 && val <= 766) {
                this.albumRotateSize = 450;
                this.albumRotateStyle = 'border:70px solid rgb(12, 12, 12);';
            }
            if (val > 766 && val < 1000) {
                this.albumRotateSize = 160;
                this.albumRotateStyle = 'border:32px solid rgb(12, 12, 12);';
            }
            if (val >= 1000) {
                this.albumRotateSize = 200;
                this.albumRotateStyle = 'border:40px solid rgb(12, 12, 12);';
            }
        }
    }
</script>

<style lang="scss" scoped>
    .demo-container {
        .row {
            margin-bottom: 20px;

            &:last-child {
                margin-bottom: 0;
            }
        }
    }

    .album {
        width: 100%;
        display: inline-block;
        cursor: pointer;
        transition-duration: 0.2s;
        padding: 4px;
        border: 32px solid rgb(16, 16, 16);;
        border-radius: 50%;
        background: linear-gradient(rgb(39, 39, 39), rgb(0, 0, 0), rgb(0, 0, 0), rgb(39, 39, 39));
        box-shadow: 0 0 20px 2px #000;
    }

    .album-rotate {
        animation: rotate 20s linear infinite;
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg)
        }
        to {
            transform: rotate(360deg)
        }
    }
</style>
