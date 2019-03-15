<template>
    <div class="empty_wrapper">
        <div>
            <h3>请配置config.json：</h3>
            <p>EOSNode：EOS节点</p>
            <p>EOS_park_apikey:</p>
            <p class="p3">请自行前往<a href='#' @click="openEOSPark()">eospark</a>申请，一个key只能订阅两个账户，可以申请多个。 </p>
            <p>notice_threshold：推送的交易额阀值</p>
            <p>accounts：需要监控的账户</p>
            <p class="p3">offset：往前取多少条交易</p>
            <p class="p3">watch：是否订阅推送</p>
            <el-button @click="openConfig()" class="open-btn" type="primary" size="mini">打开</el-button>
        </div>
    </div>
</template>

<script>
  import { shell } from 'electron';
  const { app } = require('electron').remote;
  import path from 'path';

  export default {
    name: "addAccount",
    props: [],
    computed: {

    },
    data: function () {
      return {
        dialogVisible: false,
      }
    },
    methods: {
      openEOSPark: function() {
        shell.openExternal('https://developer.eospark.com/api-doc/zh/websocket/')
      },
      openConfig: function() {
        const p = path.join(app.getPath('userData'));
        shell.openItem(p)
      }
    },
    mounted() {
    }
  }
</script>

<style scoped>
    .empty_wrapper {
        margin-top: 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    h3 {
        line-height: 2.4;
        margin-left: 24px;

    }

    p {
        line-height: 2;
        margin-left: 48px
    }

    .p3 {
        margin-left: 72px
    }

    .open-btn {
        margin-top: 20px;
        margin-left: 24px;
    }
</style>
