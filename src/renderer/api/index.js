const apikey = 'a9564ebc3289b7a14551baf8ad5ec60a';
const baseUrl = 'https://api.eospark.com/api';

const obj2param = (obj) => {
  if (obj) {
    return Object.keys(obj).map(key => `&${key}=${obj[key]}`).join('')
  }
  return '';
};

export const getTrx = (obj) => `${baseUrl}?module=account&action=get_account_related_trx_info&apikey=${apikey}${obj2param(obj)}`;
