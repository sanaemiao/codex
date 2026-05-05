const AD_UNIT_ID = 'adunit-demo-rewarded-video';
let rewardedVideoAd = null;

function initAd() {
  if (typeof wx === 'undefined' || !wx.createRewardedVideoAd) return;
  rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: AD_UNIT_ID });
  rewardedVideoAd.onError(() => {});
}

async function showReviveAd() {
  if (!rewardedVideoAd) return { ok: false, reason: 'ad_not_supported' };

  return new Promise((resolve) => {
    const onClose = (res) => {
      rewardedVideoAd.offClose(onClose);
      const ok = res === undefined || !!res.isEnded;
      resolve({ ok, reason: ok ? 'completed' : 'interrupted' });
    };

    rewardedVideoAd.onClose(onClose);
    rewardedVideoAd.show().catch(() => {
      rewardedVideoAd.load()
        .then(() => rewardedVideoAd.show())
        .catch(() => {
          rewardedVideoAd.offClose(onClose);
          resolve({ ok: false, reason: 'ad_unavailable' });
        });
    });
  });
}

module.exports = { initAd, showReviveAd };
