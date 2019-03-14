import axios from 'axios'
import { getTrx } from '../api';
import { Api, JsonRpc } from "eosjs";

// http://eu.eosdac.io
// http://eos.greymass.com
const rpc = new JsonRpc('http://eu.eosdac.io');

// 历史回溯
getHis();

export function getHis(state = {}) {
  const { history = [], offset = -20 } = state;

  rpc.history_get_actions('eospstotoken', -1, offset)
    .then((res) => {
      const { actions } = res;
      console.log(res, actions.length, 'response');
    });
}

