import asyncRoute from 'lib/asyncRoute';

// require('babel-register')({
//     plugins: ['dynamic-import-node']
// })

/**
 * Home
 */
export const Idle = asyncRoute(() => import(/* webpackChunkName: 'Home' */'./home/view/Idle.js'));
// export const Home = asyncRoute(() => import(/* webpackChunkName: 'Home' */'./home/view/Home.js'));
export const HomeDynamic = asyncRoute(() => import(/* webpackChunkName: 'Home' */'./home/view/HomeDynamic.js'));
export const TvApp = asyncRoute(() => import(/* webpackChunkName: 'TvApp' */'./home/view/TvApp.js'));
// export const HomeOther = asyncRoute(() => import(/* webpackChunkName: 'HomeOther' */'./home/view/HomeOther.js'));
export const GenreDetails = asyncRoute(() => import(/* webpackChunkName: 'GenreDetails' */'./home/view/GenreDetails.js'));

export const SweatHome = asyncRoute(() => import(/* webpackChunkName: 'SweatHome' */'./SweatHome'));
export const Home = asyncRoute(() => import(/* webpackChunkName: 'SweatHome' */'./SweatHome'));
export const HomeOther = asyncRoute(() => import(/* webpackChunkName: 'SweatHome' */'./SweatHome/OtherSweatHome'));
/**
 * 전체메뉴
 */
export const AllMenu = asyncRoute(() => import(/* webpackChunkName: 'AllMenu' */'./allMenu/AllMenu.js'));

/**
 * 실시간
 */
// export const Organization = asyncRoute(() => import(/* webpackChunkName: 'Organization' */'./liveTv/organization/Organization.js'));
export const BoxOffice = asyncRoute(() => import(/* webpackChunkName: 'BoxOffice' */'./liveTv/boxOffice/BoxOffice.js'));
export const SetFavorChn = asyncRoute(() => import(/* webpackChunkName: 'SetFavorChn' */'./liveTv/setting/SetFavorChn.js'));
export const SetBlockChn = asyncRoute(() => import(/* webpackChunkName: 'SetBlockChn' */'./liveTv/setting/SetBlockChn.js'));
export const ChannelPlus = asyncRoute(() => import(/* webpackChunkName: 'ChannelPlus' */'./liveTv/channelplus/ChannelPlus.js'));

/**
 * 구매
 */
export const BuyShort = asyncRoute(() => import(/* webpackChunkName: 'BuyShort' */'./buy/view/BuyShort.js'));
export const BuyChannel = asyncRoute(() => import(/* webpackChunkName: 'BuyChannel' */'./buy/view/BuyChannel.js'));
export const BuyMonthly = asyncRoute(() => import(/* webpackChunkName: 'BuyMonthly' */'./buy/view/BuyMonthly.js'));
export const BuyBill = asyncRoute(() => import(/* webpackChunkName: 'BuyBill' */'./buy/view/BuyBill.js'));
export const BuyBillChannel = asyncRoute(() => import(/* webpackChunkName: 'BuyBillChannel' */'./buy/view/BuyBillChannel.js'));
export const BuyBillMonthly = asyncRoute(() => import(/* webpackChunkName: 'BuyBillMonthly' */'./buy/view/BuyBillMonthly.js'));
export const OkCashBag = asyncRoute(() => import(/* webpackChunkName: 'OkCashBag' */'./buy/view/BuyBill.js'));
export const BillCoupon = asyncRoute(() => import(/* webpackChunkName: 'BillCoupon' */'./buy/view/BillCoupon'));
export const BillDeliveryPhone = asyncRoute(() => import(/* webpackChunkName: 'BillDeliveryPhone' */'./buy/view/BillDeliveryPhone.js'));
export const BillCertify = asyncRoute(() => import(/* webpackChunkName: 'BillCertify' */'./buy/view/BillCertify.js'));
export const CertifyPopup = asyncRoute(() => import(/* webpackChunkName: 'CertifyPopup' */'./buy/popup/CertifyPopup.js'));
export const BillPhoneCertify = asyncRoute(() => import(/* webpackChunkName: 'BillPhoneCertify' */'./buy/view/BillPhoneCertify.js'));

/**
 * 시놉시스
 */
export const SynopsisView = asyncRoute(() => import(/* webpackChunkName: 'SynopsisView' */'./synopsis/SynopsisView.js'));
export const SynopsisViewOther = asyncRoute(() => import(/* webpackChunkName: 'SynopsisViewOther' */'./synopsis/SynopsisViewOther.js'));
export const SynopShort = asyncRoute(() => import(/* webpackChunkName: 'SynopShort' */'./synopsis/SynopShort.js'));
export const SynopSeries = asyncRoute(() => import(/* webpackChunkName: 'SynopSeries' */'./synopsis/SynopSeries.js'));
export const SynopGateWay = asyncRoute(() => import(/* webpackChunkName: 'SynopGateWay' */'./synopsis/SynopGateWay.js'));
export const SynopPersonalInformation = asyncRoute(() => import(/* webpackChunkName: 'SynopPersonalInformation' */'./synopsis/SynopPersonalInformation.js'));
export const SynopVodProduct = asyncRoute(() => import(/* webpackChunkName: 'SynopVodProduct' */'./synopsis/SynopVodProduct.js'));
// export const SynopShortSteel = asyncRoute(() => import('./synopsis/SynopShortSteel.js'));
export const SynopEnding = asyncRoute(() => import(/* webpackChunkName: 'SynopEnding' */'./synopsis/SynopEnding'));

/**
 * 공통
 */
export const CommonView = asyncRoute(() => import(/* webpackChunkName: 'CommonView' */'./common/CommonView.js'));

/**
 * myBtv
 */

export const MyBtvHome = asyncRoute(() => import(/* webpackChunkName: 'MyBtvHome' */'./myBtv/view/MyBtvHome.js'));
export const MyVodList = asyncRoute(() => import(/* webpackChunkName: 'MyVodList' */'./myBtv/view/MyVodList.js'));
export const MyVodDetail = asyncRoute(() => import(/* webpackChunkName: 'MyVodDetail' */'./myBtv/view/MyVodDetail.js'));
export const MyVodSeasonDetail = asyncRoute(() => import(/* webpackChunkName: 'MyVodSeasonDetail' */'./myBtv/view/MyVodSeasonDetail.js'));
export const RecommendVodList = asyncRoute(() => import(/* webpackChunkName: 'RecommendVodList' */'./myBtv/view/RecommendVodList.js'));
export const EditRecentVodList = asyncRoute(() => import(/* webpackChunkName: 'EditRecentVodList' */'./myBtv/view/EditRecentVodList.js'));
export const BookmarkList = asyncRoute(() => import(/* webpackChunkName: 'BookmarkList' */'./myBtv/view/BookmarkList.js'));
export const EditBookmarkList = asyncRoute(() => import(/* webpackChunkName: 'EditBookmarkList' */'./myBtv/view/EditBookmarkList.js'));

export const MyWishTotalList = asyncRoute(() => import(/* webpackChunkName: 'MyWishTotalList' */'./myBtv/my/MyWishTotalList.js'));
export const MyWishTotalDelete = asyncRoute(() => import(/* webpackChunkName: 'MyWishTotalDelete' */'./myBtv/my/MyWishTotalDelete.js'));
export const MyWishAllDel = asyncRoute(() => import(/* webpackChunkName: 'MyWishAllDel' */'./myBtv/my/MyWishAllDel.js'));
export const MyWishEdit = asyncRoute(() => import(/* webpackChunkName: 'MyWishEdit' */'./myBtv/my/MyWishEdit.js'));
export const RecentVodEdit = asyncRoute(() => import(/* webpackChunkName: 'RecentVodEdit' */'./myBtv/my/RecentVodEdit.js'));
export const RecentVodAllDel = asyncRoute(() => import(/* webpackChunkName: 'RecentVodAllDel' */'./myBtv/my/RecentVodAllDel.js'));
export const BtvProductInfo = asyncRoute(() => import(/* webpackChunkName: 'BtvProductInfo' */'./myBtv/product/BtvProductInfo.js'));
export const BtvProductDetail = asyncRoute(() => import(/* webpackChunkName: 'BtvProductDetail' */'./myBtv/product/BtvProductDetail.js'));
export const BtvProductChangeApplication = asyncRoute(() => import(/* webpackChunkName: 'BtvProductChangeApplication' */'./myBtv/product/BtvProductChangeApplication.js'));
export const BtvProductChangeEnd = asyncRoute(() => import(/* webpackChunkName: 'BtvProductChangeEnd' */'./myBtv/product/BtvProductChangeEnd.js'));

export const CouponDetail = asyncRoute(() => import(/* webpackChunkName: 'CouponDetail' */'./myBtv/coupon/CouponDetail.js'));
export const CouponRegist = asyncRoute(() => import(/* webpackChunkName: 'CouponRegist' */'./myBtv/coupon/CouponRegist.js'));

export const OkCashManage = asyncRoute(() => import(/* webpackChunkName: 'OkCashManage' */'./myBtv/okcash/OkCashManage.js'));
export const OkCashRegist = asyncRoute(() => import(/* webpackChunkName: 'OkCachRegist' */'./myBtv/okcash/OkCashRegist.js'));
export const OkCashbagCardDelete = asyncRoute(() => import(/* webpackChunkName: OkCashbagCardDelete' */'./myBtv/okcash/OkCashbagCardDelete.js'));

export const BpointHistory = asyncRoute(() => import(/* webpackChunkName: 'BpointHistory' */'./myBtv/bPoint/BpointHistory.js'));
export const BpointDetail = asyncRoute(() => import(/* webpackChunkName: 'BpointDetail' */'./myBtv/bPoint/BpointDetail.js'));
export const BpointRegist = asyncRoute(() => import(/* webpackChunkName: 'BpointRegist' */'./myBtv/bPoint/BpointRegist.js'));

export const Tmembership = asyncRoute(() => import(/* webpackChunkName: 'Tmembership' */'./myBtv/tmembership/Tmembership.js'));
export const TmembershipEnrollment = asyncRoute(() => import(/* webpackChunkName: 'TmembershipEnrollment' */'./myBtv/tmembership/TmembershipEnrollment.js'));
export const TmembershipRegist = asyncRoute(() => import(/* webpackChunkName: 'TmembershipRegist' */'./myBtv/tmembership/TmembershipRegist.js'));
export const TmembershipDelete = asyncRoute(() => import(/* webpackChunkName: 'TmembershipDelete' */'./myBtv/tmembership/TmembershipDelete.js'));

export const NoticeList = asyncRoute(() => import(/* webpackChunkName: 'NoticeList' */'./myBtv/notice/NoticeList.js'));
export const NoticeBoxList = asyncRoute(() => import(/* webpackChunkName: 'NoticeBoxList' */'./myBtv/notice/NoticeBoxList.js'));
export const ListTextDetail = asyncRoute(() => import(/* webpackChunkName: 'ListTextDetail' */'./myBtv/notice/ListTextDetail.js'));
export const UseGuideItemPop = asyncRoute(() => import(/* webpackChunkName: 'UseGuideItemPop' */'./myBtv/notice/UseGuideItemPop'));
export const BoxListTextDetail = asyncRoute(() => import(/* webpackChunkName: 'BoxListTextDetail' */'./myBtv/notice/BoxListTextDetail.js'));

export const PossessionVOD = asyncRoute(() => import(/* webpackChunkName: 'PossessionVOD' */'./myBtv/VOD/PossessionVODDetail.js'));
export const PossessionVODSeries = asyncRoute(() => import(/* webpackChunkName: 'PossessionVODSeries' */'./myBtv/VOD/PossessionVODSeriesDetail.js'));
export const PossessionVODTotalList = asyncRoute(() => import(/* webpackChunkName: 'PossessionVODTotalList' */'./myBtv/VOD/PossessionVODTotalList.js'));
export const OwnVODRecommendList = asyncRoute(() => import(/* webpackChunkName: 'OwnVODRecommendList' */'./myBtv/VOD/OwnVODRecommendList.js'));

export const PurchaseList = asyncRoute(() => import(/* webpackChunkName: 'PurchaseList' */'./myBtv/purchase/PurchaseList.js'));
export const PackageProduct = asyncRoute(() => import(/* webpackChunkName: 'PackageProduct' */'./myBtv/purchase/view/PackageProduct'));
export const CommerceProduct = asyncRoute(() => import(/* webpackChunkName: 'CommerceProduct' */'./myBtv/purchase/view/CommerceProduct'));
export const CommerceSlide = asyncRoute(() => import(/* webpackChunkName: 'CommerceSlide' */'./myBtv/purchase/components/CommerceSlide'));

/**
 *  월정액
 */
export const HomeJoinAfter = asyncRoute(() => import(/* webpackChunkName: 'HomeJoinAfter' */'./monthly/view/HomeJoinAfter.js'));
export const HomeJoinBefore = asyncRoute(() => import(/* webpackChunkName: 'HomeJoinBefore' */'./monthly/view/HomeJoinBefore.js'));
export const MonthlyDetail = asyncRoute(() => import(/* webpackChunkName: 'MonthlyDetail' */'./monthly/view/MonthlyDetail.js'));

/**
 * 키즈존
 */
export const KidsHome = asyncRoute(() => import(/* webpackChunkName: 'KidsHome' */'./kids/Kids.js'));
export const CharacterHome = asyncRoute(() => import(/* webpackChunkName: 'CharacterHome' */'./kids/components/CharacterHome.js'));
export const CharacterList = asyncRoute(() => import(/* webpackChunkName: 'CharacterList' */'./kids/character/CharacterList.js'));
export const CharacterEdit = asyncRoute(() => import(/* webpackChunkName: 'CharacterEdit' */'./kids/character/CharacterEdit.js'));
export const GenreMenuBlock = asyncRoute(() => import(/* webpackChunkName: 'GenreMenuBlock' */'./kids/genremenu/GenreMenuBlock.js'));
export const GenreMenuList = asyncRoute(() => import(/* webpackChunkName: 'GenreMenuList' */'./kids/genremenu/GenreMenuList.js'));
export const GenreAll = asyncRoute(() => import(/* webpackChunkName: 'GenreAll' */'./kids/components/GenreAll.js'));
export const PlayBlock = asyncRoute(() => import(/* webpackChunkName: 'PlayBlock' */'./kids/play/PlayBlock.js'));
export const PlayList = asyncRoute(() => import(/* webpackChunkName: 'PlayList' */'./kids/play/PlayList.js'));
export const MonthlyHome = asyncRoute(() => import(/* webpackChunkName: 'MonthlyHome' */'./kids/components/MonthlyHome.js'));
export const KidsMonthlyDetail = asyncRoute(() => import(/* webpackChunkName: 'KidsMonthlyDetail' */'./kids/monthly/KidsMonthlyDetail.js'));
export const SubCharacter = asyncRoute(() => import(/* webpackChunkName: 'SubCharacter' */'./kids/character/SubCharacter.js'));
export const PlayLearning = asyncRoute(() => import(/* webpackChunkName: 'PlayLearning' */'./kids/components/PlayLearning.js'));
export const Channel = asyncRoute(() => import(/* webpackChunkName: 'Channel' */'./kids/components/Channel.js'));
export const widgetSample = asyncRoute(() => import(/* webpackChunkName: 'widgetSample' */'./kids/widget/widgetSample.js'));
export const PlayGuideWatchDistance = asyncRoute(() => import(/* webpackChunkName: 'PlayGuideWatchDistance' */'./kids/playguide/PlayGuideWatchDistance'));
export const PlayGuideWatchLimit = asyncRoute(() => import(/* webpackChunkName: 'PlayGuideWatchLimit' */'./kids/playguide/PlayGuideWatchLimit'));
export const PlayGuideWatchEnd = asyncRoute(() => import(/* webpackChunkName: 'PlayGuideWatchEnd' */'./kids/playguide/PlayGuideWatchEnd'));
export const PlayGuideEnd = asyncRoute(() => import(/* webpackChunkName: 'PlayGuideEnd' */'./kids/playguide/PlayGuideEnd'));
export const kidsViewMove = asyncRoute(() => import(/* webpackChunkName: 'kidsViewMove' */'./kids/kidsViewMove'));

/**
 * 검색
 */
export const SearchMain = asyncRoute(() => import(/* webpackChunkName: 'SearchMain' */'./search/view/SearchMain.js'));
export const SearchHome = asyncRoute(() => import(/* webpackChunkName: 'SearchHome' */'./search/view/SearchHome.js'));
export const SearchResult = asyncRoute(() => import(/* webpackChunkName: 'SearchResult' */'./search/view/SearchResult.js'));
export const SearchResultNone = asyncRoute(() => import(/* webpackChunkName: 'SearchResultNone' */'./search/view/SearchResultNone.js'));
export const SearchResultOther = asyncRoute(() => import(/* webpackChunkName: 'SearchResultOther' */'./search/view/SearchResultOther.js'));

/**
 *  인증
 */


/**
 *  레퍼런스 샘플
 */
export const PhoneCertification = asyncRoute(() => import(/* webpackChunkName: 'PhoneCertification' */'./referenceSample/PhoneCertification/PhoneCertification.js'));

/**
 * STB I/F Test
 */
export const StbTest = asyncRoute(() => import(/* webpackChunkName: 'StbTest' */'./stbTest/StbTest.js'));

export const ScheduleChart = asyncRoute(() => import(/* webpackChunkName: 'ScheduleChart' */'./deadTv'));


export const TestCase = asyncRoute(() => import(/* webpackChunkName: 'TestCase' */'./TestCase'));