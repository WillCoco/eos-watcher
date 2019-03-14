<template>
  <div id="container">
    <el-row>
      <el-col :span="2">
        <el-button @click="test()" class="btn-setting" type="text" icon="el-icon-menu"></el-button>
      </el-col>
    </el-row>
    <!--<add-account></add-account>-->
    <div v-for="(account, index) in accountsName">
      <el-row>
        <el-col :span="1" :offset="2" style="text-align: center">
          {{ index + 1 }}.
        </el-col>
        <el-col :span="18" style="text-align: center;">
          <chart v-bind:accountName="account" v-bind:accounts="accounts" v-bind:index="index" v-bind:b="b"></chart>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import Chart from './Chart'
  import AddAccount from './AddAccount'

  export default {
    name: 'home',
    components: { Chart, AddAccount },
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
      b: function() {
        const { b } = this.$store.state.accounts;
        console.log(b);
        return b;
      }
    },
    methods: {
      getHis: function() {
        this.$store.dispatch('updateHistory')
      },
      test: function() {
        this.$store.dispatch('testb')
      }
    },
    created() {
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
