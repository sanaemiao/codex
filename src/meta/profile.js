const STORAGE_KEY = 'rogue_meta_profile_v1';
const MAX_LV = 20;

function defaultProfile() {
  return { coins: 0, atkLv: 0, hpLv: 0, fireLv: 0, bestScore: 0 };
}

function loadProfile() {
  if (typeof wx === 'undefined' || !wx.getStorageSync) return defaultProfile();
  const data = wx.getStorageSync(STORAGE_KEY);
  return data ? { ...defaultProfile(), ...data } : defaultProfile();
}

function saveProfile(profile) {
  if (typeof wx === 'undefined' || !wx.setStorageSync) return;
  wx.setStorageSync(STORAGE_KEY, profile);
}

function applyMetaToState(profile, state) {
  state.player.damage += profile.atkLv * 2;
  state.player.maxHp += profile.hpLv * 10;
  state.player.hp += profile.hpLv * 10;
  state.player.fireRate = Math.max(4, state.player.fireRate - Math.floor(profile.fireLv * 0.7));
}

function rewardSettlement(profile, score) {
  const gain = Math.max(5, Math.floor(score / 20));
  profile.coins += gain;
  if (score > profile.bestScore) profile.bestScore = score;
  return gain;
}

function getUpgradeCost(profile, type) {
  const lv = type === 'atk' ? profile.atkLv : type === 'hp' ? profile.hpLv : profile.fireLv;
  return Math.floor((type === 'fire' ? 55 : 45) * (1 + lv * 0.55));
}

function tryUpgrade(profile, type) {
  const lv = type === 'atk' ? profile.atkLv : type === 'hp' ? profile.hpLv : profile.fireLv;
  if (lv >= MAX_LV) return false;
  const cost = getUpgradeCost(profile, type);
  if (profile.coins < cost) return false;

  profile.coins -= cost;
  if (type === 'atk') profile.atkLv += 1;
  if (type === 'hp') profile.hpLv += 1;
  if (type === 'fire') profile.fireLv += 1;
  return true;
}

module.exports = { loadProfile, saveProfile, applyMetaToState, rewardSettlement, tryUpgrade, getUpgradeCost, MAX_LV };
