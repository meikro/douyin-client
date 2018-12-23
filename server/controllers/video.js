const APIError = require('../rest').APIError
const VideoInfo = require('../models/VideoInfo')
const redisClient = require('../redis')

const KEY_WATCH_NUM = 'videoWatchNum'
const KEY_SHARE_NUM = 'videoShareNum'
const KEY_LIKE_NUM = 'videoLikeNum'
const KEY_COMMENT_NUM = 'videoCommentNum'
const VIDEO_NUM = 15

module.exports = {
  'GET /api/common/video/getPopularVideo': async (ctx, next) => {
    let key = 'popularVideoList'
    let isExists = await redisClient.exists(key)
    if (!isExists) {
      let topWatchVid = await redisClient.zrevrange(KEY_WATCH_NUM, 0, VIDEO_NUM)
      let topShareVid = await redisClient.zrevrange(KEY_SHARE_NUM, 0, VIDEO_NUM)
      let topLikeVid = await redisClient.zrevrange(KEY_LIKE_NUM, 0, VIDEO_NUM)
      let topCommentVid = await redisClient.zrevrange(KEY_COMMENT_NUM, 0, VIDEO_NUM)
      let summary = [...topWatchVid, ...topShareVid, ...topLikeVid, ...topCommentVid]
      let VideoSetId = new Set()
      for (let i of summary) {
        VideoSetId.add(i)
      }
      let videoInfoList = []
      summary = []
      for (var videoId of VideoSetId) {
        var videoInfo = await VideoInfo.findOne({
          where: {
            videoId
          }
        })
        await redisClient.sadd(key, JSON.stringify(videoInfo))
        videoInfoList.push(videoInfo)
      }
      // 5分钟超时
      redisClient.expire(key, 300)
    }
    let res = await redisClient.srandmember(key, 20)
    ctx.rest(res)
  },
  'GET /api/video/:videoId/getVideoInfo': async (ctx, next) => {
    const videoId = ctx.params.videoId
    let vi = await VideoInfo.findOne({
      where: {
        videoId
      }
    })
    if (vi) {
      ctx.rest(vi)
    } else {
      throw new APIError('video:not_found', 'video not found bt videoId.')
    }
  },
  'GET /api/video/:videoId/getVideoLike': async (ctx, next) => {
    const videoId = ctx.params.videoId
    let vi = await VideoInfo.findOne({
      where: {
        videoId
      }
    })
    if (vi) {
      const likeInfolist = await vi.getLikeInfos()
      ctx.rest(likeInfolist)
    } else {
      throw new APIError('video:not_found', 'video not found bt videoId.')
    }
  },
  'GET /api/video/:videoId/getVideoShare': async (ctx, next) => {
    const videoId = ctx.params.videoId
    let vi = await VideoInfo.findOne({
      where: {
        videoId
      }
    })
    if (vi) {
      const shareInfolist = await vi.getShareInfos()
      ctx.rest(shareInfolist)
    } else {
      throw new APIError('video:not_found', 'video not found bt videoId.')
    }
  },
  'GET /api/video/:videoId/getVideoWatch': async (ctx, next) => {
    const videoId = ctx.params.videoId
    let vi = await VideoInfo.findOne({
      where: {
        videoId
      }
    })
    if (vi) {
      const watchInfolist = await vi.getWatchInfos()
      ctx.rest(watchInfolist)
    } else {
      throw new APIError('video:not_found', 'video not found bt videoId.')
    }
  },
  'GET /api/video/:videoId/getVideoComment': async (ctx, next) => {
    const videoId = ctx.params.videoId
    let vi = await VideoInfo.findOne({
      where: {
        videoId
      }
    })
    if (vi) {
      const commentInfolist = await vi.getCommentInfos()
      ctx.rest(commentInfolist)
    } else {
      throw new APIError('video:not_found', 'video not found bt videoId.')
    }
  }
}