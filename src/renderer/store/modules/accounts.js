const { app } = require('electron').remote;
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { Api, JsonRpc } from "eosjs";

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

const defaultConfig = {
  EOSNode: 'http://api.eossweden.se',
  accounts: {
    'eospstotoken': {
      offset: defaultOffset,
    }
  },
};

const state = {
  account: {

  },
  a: 0,
  b: {
    b: 0
  }
};

const mutations = {
  RESET_ACCOUNT (state, payload) {
    console.log('RESET_ACCOUNT');
    state.account = payload.account;
  },
  UPDATE_ACCOUNT (state, payload) {
    console.log(state,'UPDATE_OFFSET');
    // Vue.set(state, 'account', { ...state.account, [payload.name]: {...state.account[payload.name], ...payload.history} })
    state.account = { ...state.account, [payload.name]: {...state.account[payload.name], ...payload.history} };
  },
  UPDATE_OFFSET (state, payload) {
    // state.offset = payload.offset;
  },
};

const actions = {
  async init({ commit}) {
    // 读取本地配置
    const p = path.join(app.getPath('userData'), 'config.json');
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

    // 初始化
    rpc = new JsonRpc(config.EOSNode);

    commit('RESET_ACCOUNT', { account: config.accounts });
  },
  async updateHistory ({ commit, state }, payload = {}) {
    if (payload.loadMore) {
      commit('UPDATE_OFFSET', {offset: state.offset - baseGap})
    }

    const allGet = Object.keys(state.account || {}) || [];
    allGet.map((name) =>
        new Promise(
          (resolve) =>
          getHis(name, state.account[name].offset)
            .then((res) => {
              commit('UPDATE_OFFSET', {offset: state.offset - baseGap});

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

export default {
  state,
  mutations,
  actions
}
