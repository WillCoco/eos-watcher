<template>
    <div class="wrapper">
        <el-button @click="dialogVisible=true" class="btn-add" type="text" icon="el-icon-plus"></el-button>
        <el-dialog class="dialog" title="账户管理" :visible.sync="dialogVisible">
            <div class="dialog-content">
                <div v-for="name in accountsName1" class="accounts-wrapper">
                    <span class="account-name">{{ name }}</span>
                    <el-button @click="deleteAccount(true)" class="btn-delete" type="text" icon="el-icon-delete"></el-button>
                </div>
                <el-form class="form" :model="form">
                    <el-form-item label-width="120px">
                        <el-input class="add-input" v-model="form.name" autocomplete="off"></el-input>
                        <el-button @click="addAccount(true)" class="btn-add" type="text" icon="el-icon-plus"></el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="submit(false)">取 消</el-button>
                <el-button type="primary" @click="submit(true)">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
  export default {
    name: "addAccount",
    props: [],
    computed: {
      accountsName: function() {
        return Object.keys(this.$store.getters.chartData) || [];
      },
      accountsName1: function() {
        const a = Object.keys(this.$store.getters.chartData);
        return a
      },
      chartData: function() {
        return this.$store.getters.chartData;
      }
    },
    data: function () {
      return {
        dialogVisible: false,
        form: {
          name: '',
          region: 1
        }
      }
    },
    methods: {
      submit: function() {

        this.dialogVisible = false;
      },
      deleteAccount: function() {

      },
      addAccount: function() {

      }
    },
    mounted() {
    }
  }
</script>

<style scoped>
    .btn-add {
        position: fixed;
        right: 48px;
        top: 18px;
    }

    .accounts-wrapper {
        text-align: center
    }

    .account-name {
        display: inline-block;
        width: 100px;
        margin: 0 auto;
    }

    .btn-delete {
        margin-left: 18px;
    }

    .dialog {
    }

    .dialog-content {
        max-height: 200px;
        overflow: auto;
        margin-top: -20px;
        margin-bottom: -20px;
    }

    .add-input {
        width: 140px;
        margin-left: -40px;
    }

</style>
