<template>
  <div id="container">
    <!--<add-account></add-account>-->
    <Empty v-if="accountsName.length === 0" />
    <div v-else v-for="(account, index) in accountsName">
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
  import Chart from './Chart'
  import Empty from './Empty'
  import { ipcRenderer } from 'electron'
  import throttle from 'lodash/throttle'

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
    },
    created() {
      ipcRenderer.on('refresh', () => {
        if (this.$store.state.accounts.inited) {
          const getH = throttle(this.getHis, 1000);
          getH();
        }
      });

      this.$store.dispatch('init')
        .then(() => {
          this.getHis();
        });
    },
  }
</script>

<style>
  * {
    margin: 0;
    padding: 0;
  }

  #container {
    padding: 12px 24px 24px 24px;
  }

  .grid-content {
    min-height: 36px;
  }

  .btn-setting > i, .btn-add > i {
    font-size: 18px
  }

</style>
