# Debug Session: audio-no-sound

Status: [OPEN]

## Problem
播放页显示播放器，但点击播放没有声音。

## Hypotheses
1. TTS 返回的 `audioUrl` 是临时远程地址，已失效或被浏览器拦截。
2. 点击播放时音频尚未加载完成，随后状态切换触发了 `pause()`，所以出现 `play() request was interrupted`。
3. 缓存表里保存了空的 `audio_url`，页面显示播放器但实际没有可播放音频。
4. TTS 接口请求失败，前端没有明确报错，只显示了文字。
5. 当前页面多次生成/跳转导致旧的音频请求被 abort，但最新音频仍未成功加载。

## Evidence Log
- Pending.
