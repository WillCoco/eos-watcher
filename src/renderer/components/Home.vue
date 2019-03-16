<template>
  <div id="container">
    <el-button @click="openConfig()" class="setting-btn" icon="el-icon-setting" circle></el-button>
    <el-button @click="init()" class="refresh-btn" icon="el-icon-refresh" circle></el-button>
    <Empty v-if="accountsName.length === 0" />
    <div class="charts-box" v-else v-for="(account, index) in accountsName">
      <el-row>
        <el-col :span="1" :offset="2" style="text-align: center">
          {{ index + 1 }}.
        </el-col>
        <el-col :span="18" style="text-align: center;">
          <chart v-bind:accountName="account" v-bind:accounts="accounts" v-bind:index="index"></chart>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import { shell, ipcRenderer } from 'electron';
  const { app } = require('electron').remote;
  import path from 'path';
  import throttle from 'lodash/throttle'
  import Chart from './Chart'
  import Empty from './Empty'

  export default {
    name: 'home',
    components: { Chart, Empty },
    computed: {
      accountsName: function() {
        const { account = {} } = this.$store.state.accounts || {};
        return Object.keys(account) || [];
      },
      accounts: function() {
        const { account = {} } = this.$store.state.accounts || {};
        console.log(account || [], 112);
        return account;
      },
    },
    methods: {
      getHis: function() {
        this.$store.dispatch('updateHistory')
      },
      openConfig: function() {
        const p = path.join(app.getPath('userData'));
        shell.openItem(p)
      },
      init: function() {
        this.$store.dispatch('init')
          .then(() => {
            this.getHis();
          });
      }
    },
    created() {
      ipcRenderer.on('refresh', () => {
        if (this.$store.state.accounts.inited) {
          const getH = throttle(this.getHis, 1000);
          getH();
        }
      });

      this.init()
    },
  }
</script>

<style>
  * {
    margin: 0;
    padding: 0;
  }

  #container {
    padding: 40px 24px 24px 24px;
  }

  .charts-box {
    margin-top: 24px;
  }

  .grid-content {
    min-height: 36px;
  }

  .btn-setting > i, .btn-add > i {
    font-size: 18px
  }

  .setting-btn {
    top: 24px;
    right: 48px;
  }

</style>
