const { remote, ipcRenderer } = require('electron');
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { JsonRpc } from "eosjs";

const baseGap = 20;
const defaultOffset = -500;

// account = {
//   'eospstotoken': {
//     offset: defaultOffset,
//     data: {
//       summary: {
//
//       },
//       history: {
//         ...data,
//         moment: Moment,
//         day: 'YYYY-MM-DD',
//         isIncome: Boolean
//       },
//
//     }
//   }
// };

// http://api.eossweden.se
// http://eu.eosdac.io
let rpc = new JsonRpc('http://api.eossweden.se');
let WSSs;
let threshold;

const defaultConfig = {
  EOSNode: 'http://api.eossweden.se',
  EOS_park_apikey: ['425c1330e00c823155ae3963fdaed2f8'],
  notice_threshold: 500,
  accounts: {
    'eospstotoken': {
      offset: defaultOffset,
      watch: true
    }
  },
};

const state = {
  inited: false,
  account: {

  },
  a: 0,
  b: {
    b: 0
  }
};

const mutations = {
  INIT (state, payload) {
    state.inited = true;
  },
  RESET_ACCOUNT (state, payload) {
    console.log('RESET_ACCOUNT');
    state.account = payload.account;
  },
  UPDATE_ACCOUNT (state, payload) {
    console.log(state,'UPDATE_OFFSET');
    state.account = { ...state.account, [payload.name]: {...state.account[payload.name], ...payload.history} };
  }
};

const actions = {
  async init({ commit}) {
    // 读取本地配置
    const p = path.join(remote.app.getPath('userData'), 'config.json');
    let config;
    try {
      const data = fs.readFileSync(p);
      config = JSON.parse(data.toString())
    } catch (err) {
      console.log(err, '没有默认配置');
      config = defaultConfig;
      fs.writeFile(p, JSON.stringify(defaultConfig), function (err) {
        if (err) console.log(err, '写默认配置错误')
      });
    }

    // listener
    if (config.notice_threshold) threshold = config.notice_threshold;
    if (config.EOS_park_apikey) WSSs = config.EOS_park_apikey.map(key => new WebSocket(`wss://ws.eospark.com/v1/ws?apikey=${key}`));
    listenAccounts(config.accounts, threshold);

    // 初始化
    rpc = new JsonRpc(config.EOSNode);

    commit('RESET_ACCOUNT', { account: config.accounts });
    commit('INIT');
  },
  async updateHistory ({ commit, state }, payload = {}) {

    const allGet = Object.keys(state.account || {}) || [];
    allGet.map((name) =>
      new Promise(
        (resolve) =>
        getHis(name, state.account[name].offset)
          .then((res) => {
            commit('UPDATE_ACCOUNT', {name, history: formatHis(res.actions, name)});
            resolve(res.actions)
          })
      )
    );
    console.log(allGet, 'allGet');
    Promise.all(allGet)
      .then(r => console.log(r, 'allGet'))
  }
};

function getHis(accountName, offset) {
  return rpc.history_get_actions(accountName, -1, offset)
    .then((res) => {
      const { actions } = res;
      console.log(res, actions.length, 'response');
      return res;
    });
}

function formatHis(history = [], name) {
  const res = {};
  history.forEach((d) => {
    const { act = {}, block_time } = d.action_trace || {};
    const { data } = act;

    // 排除其他交易
    if (data.quantity && /EOS$/.test(data.quantity)) {

      const mom = moment.utc(block_time).utcOffset("+08:00");
      const day = mom.format('YYYY-MM-DD');
      const isIncome = data.to === name && data.from !== name;

      if (!res.data) {
        res.data = {};
      }

      if (!res.data[day]) {
        res.data[day] = {};
      }

      if (!res.data[day].history) {
        res.data[day].history = [];
      }

      // 总计
      if (!res.data[day].value) {
        res.data[day].value = 0;
      }

      // 收入
      if (!res.data[day].in) {
        res.data[day].in = 0;
      }

      // 支出
      if (!res.data[day].out) {
        res.data[day].out = 0;
      }

      res.data[day].history.push({
        ...data,
        moment: mom,
        day,
        isIncome
      });

      if (isIncome) {
        res.data[day].in += parseFloat(data.quantity) || 0;
        res.data[day].value += parseFloat(data.quantity) || 0;
      } else {
        res.data[day].out += parseFloat(data.quantity) || 0;
        res.data[day].value -= parseFloat(data.quantity) || 0;
      }
    }
  });
  return res;
}

// 每个apikey分配两个监听账户
function listenAccounts(accounts, threshold) {
  if (!WSSs || !accounts) return;

  // 权限
  if(Notification.permission === 'granted'){
    console.log('用户允许通知');
  }else if(Notification.permission === 'denied'){
    console.log('用户拒绝通知');
  }else{
    Notification.requestPermission()
      .then(function(permission) {
        if(permission === 'granted'){
          console.log('用户允许通知');
        }else if(permission === 'denied'){
          console.log('用户拒绝通知');
        }
      });
  }

  // 所有需要推送的账户
  const needWatch = Object.keys(accounts).filter((account) => accounts[account].watch);


  // 每个WSS可以连接两个账户
  WSSs.forEach((WSS, wsIndex) => {
    WSS.onmessage = (msgJson) => {
      const msg = JSON.parse(msgJson.data);
      if (msg.msg_type !== 'heartbeat') {
        const { actions = [] } = msg.data || {};
        const { data = {} } = actions[0] || {};
        const quantity = parseInt(data.quantity, 10);
        const isIncome = needWatch.indexOf(data.to) !== -1 && needWatch.indexOf(data.from) === -1;
        const myAccount = isIncome ? data.to : data.from;
        const icon = isIncome ? require('../../../images/income.png') : require('../../../images/payout.png');
        console.log(quantity , threshold, quantity > threshold, 121312)
        if (quantity && quantity > threshold) {
          // 通知推送
          new Notification(myAccount, {
            body: `${isIncome ? '转入' : '转出'} ${data.quantity}`,
            icon
          });

          // 设置tray
          ipcRenderer.send('setTray', `${isIncome ? '转入' : '转出'} ${data.quantity}`)
        }
      }
    };

    WSS.onopen = () => {
      console.log(needWatch[wsIndex], needWatch[wsIndex+1], '加入watcher');
      if (needWatch[wsIndex]) {
        WSS.send(JSON.stringify({
          "msg_type": "subscribe_account",
          name: needWatch[wsIndex]
        }));
      }

      if (needWatch[wsIndex + 1]) {
        WSS.send(JSON.stringify({
          "msg_type": "subscribe_account",
          name: needWatch[wsIndex + 1]
        }));
      }
    }
  });
}

export default {
  state,
  mutations,
  actions
}
