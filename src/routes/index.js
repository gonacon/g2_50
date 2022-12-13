/**
 * Home
 */
export { default as Idle } from './home/view/Idle';
// export { default as Home } from './home/view/Home';
export { default as HomeDynamic } from './home/view/HomeDynamic';
// export { default as HomeOther } from './home/view/HomeOther';
export { default as TvApp } from './home/view/TvApp';
export { default as GenreDetails } from './home/view/GenreDetails';
export { default as SweatHome } from './SweatHome';
export { default as Home } from './SweatHome';
export { HomeOther } from './SweatHome';


/**
 * 전체메뉴
 */
export { default as AllMenu } from './allMenu/AllMenu';

/**
 * 실시간
 */
// export { default as Organization } from './liveTv/organization/Organization';
export { default as BoxOffice } from './liveTv/boxOffice/BoxOffice';
export { default as SetFavorChn } from './liveTv/setting/SetFavorChn';
export { default as SetBlockChn } from './liveTv/setting/SetBlockChn';
export { default as ChannelPlus } from './liveTv/channelplus/ChannelPlus';


/**
 * 구매
 */
export { default as BuyShort } from './buy/view/BuyShort';
export { default as BuyChannel } from './buy/view/BuyChannel';
export { default as BuyMonthly } from './buy/view/BuyMonthly';
export { default as BuyBill } from './buy/view/BuyBill';
export { default as BuyBillChannel } from './buy/view/BuyBillChannel';
export { default as BuyBillMonthly } from './buy/view/BuyBillMonthly';
export { default as OkCashBag } from './buy/view/BuyBill';
export { default as BillCoupon } from './buy/view/BillCoupon';
export { default as BillDeliveryPhone } from './buy/view/BillDeliveryPhone';
export { default as BillCertify } from './buy/view/BillCertify';
export { default as CertifyPopup } from './buy/popup/CertifyPopup';
export { default as BillPhoneCertify } from './buy/view/BillPhoneCertify';

/**
 * 시놉시스
 */
export { default as SynopsisView } from './synopsis/SynopsisView';
export { default as SynopsisViewOther } from './synopsis/SynopsisViewOther';
export { default as SynopShort } from './synopsis/SynopShort';
export { default as SynopSeries } from './synopsis/SynopSeries';
export { default as SynopGateWay } from './synopsis/SynopGateWay';
export { default as SynopPersonalInformation } from './synopsis/SynopPersonalInformation';
// export { default as SynopShortSteel } from './synopsis/SynopShortSteel';
export { default as SynopVodProduct } from './synopsis/SynopVodProduct';
export { default as SynopEnding } from './synopsis/SynopEnding';

/**
 *  키즈존
 */
export { default as KidsHome } from './kids';
export { default as CharacterHome } from './kids/components/CharacterHome';
export { default as CharacterList } from './kids/character/CharacterList';
export { default as CharacterEdit } from './kids/character/CharacterEdit';
export { default as GenreMenuBlock } from './kids/genremenu/GenreMenuBlock';
export { default as GenreMenuList } from './kids/genremenu/GenreMenuList';
export { default as GenreAll } from './kids/components/GenreAll';
export { default as PlayLearning } from './kids/components/PlayLearning';
export { default as PlayBlock } from './kids/play/PlayBlock';
export { default as PlayList } from './kids/play/PlayList';
export { default as MonthlyHome } from './kids/components/MonthlyHome';
export { default as KidsMonthlyDetail } from './kids/monthly/KidsMonthlyDetail';
export { default as SubCharacter } from './kids/character/SubCharacter';
export { default as Channel } from './kids/components/Channel';
export { default as widgetSample } from './kids/widget/widgetSample';
export { default as PlayGuideWatchDistance } from './kids/playguide/PlayGuideWatchDistance';
export { default as PlayGuideWatchLimit } from './kids/playguide/PlayGuideWatchLimit';
export { default as PlayGuideWatchEnd } from './kids/playguide/PlayGuideWatchEnd';
export { default as PlayGuideEnd } from './kids/playguide/PlayGuideEnd';
export { default as kidsViewMove } from './kids/kidsViewMove';

/**
 * 공통
 */
export { default as CommonView } from './common/CommonView';


/**
 * myBtv
 */
export { default as MyWishTotalList } from './myBtv/my/MyWishTotalList';
export { default as MyWishTotalDelete } from './myBtv/my/MyWishTotalDelete';
export { default as MyWishAllDel } from './myBtv/my/MyWishAllDel';
export { default as MyWishEdit } from './myBtv/my/MyWishEdit';
export { default as RecentVodEdit } from './myBtv/my/RecentVodEdit';
export { default as RecentVodAllDel } from './myBtv/my/RecentVodAllDel';
export { default as BtvProductInfo } from './myBtv/product/BtvProductInfo';
export { default as BtvProductDetail } from './myBtv/product/BtvProductDetail';
export { default as BtvProductChangeApplication } from './myBtv/product/BtvProductChangeApplication';
export { default as BtvProductChangeEnd } from './myBtv/product/BtvProductChangeEnd';

// My Btv 실제 작업완료 라우터.
export {
    default as MyBtvHome,
    MyVodList,
    MyVodDetail,
    MyVodSeasonDetail,
    RecommendVodList,
    EditRecentVodList,
    BookmarkList,
    EditBookmarkList
} from './myBtv';

export { default as CouponDetail } from './myBtv/coupon/CouponDetail';


export { default as OkCashManage } from './myBtv/okcash/OkCashManage';

export { default as BpointHistory } from './myBtv/bPoint/BpointHistory';
export { default as BpointDetail } from './myBtv/bPoint/BpointDetail';
// export { default as BpointGift } from './myBtv/bPoint/BpointGift';   // 2차개발
// export { default as CorrectSender } from './myBtv/bPoint/CorrectSender';     // 2차개발
// export { default as BpointGiftInfo } from './myBtv/bPoint/BpointGiftInfo';   // 2차 개발

export { default as Tmembership } from './myBtv/tmembership/Tmembership';

export { default as NoticeList } from './myBtv/notice/NoticeList';
export { default as NoticeBoxList } from './myBtv/notice/NoticeBoxList';
export { default as ListTextDetail } from './myBtv/notice/ListTextDetail';
export { default as UseGuideItemPop } from './myBtv/notice/UseGuideItemPop';
export { default as BoxListTextDetail } from './myBtv/notice/BoxListTextDetail';

export { default as PossessionVOD } from './myBtv/VOD/PossessionVODDetail';
export { default as PossessionVODSeries } from './myBtv/VOD/PossessionVODSeriesDetail';
export { default as PossessionVODTotalList } from './myBtv/VOD/PossessionVODTotalList';
export { default as OwnVODRecommendList } from './myBtv/VOD/OwnVODRecommendList';

export { default as PurchaseList } from './myBtv/purchase/PurchaseList';
export { default as PackageProduct } from './myBtv/purchase/view/PackageProduct';
export { default as CommerceProduct } from './myBtv/purchase/view/CommerceProduct';
export { default as CommerceSlide } from './myBtv/purchase/components/CommerceSlide';

/**
*  월정액
*/
export { default as HomeJoinAfter } from './monthly/view/HomeJoinAfter';
export { default as HomeJoinBefore } from './monthly/view/HomeJoinBefore';
export { default as MonthlyDetail } from './monthly/view/MonthlyDetail';

/**
 *  검색
 */
export { default as SearchMain } from './search/view/SearchMain';
export { default as SearchHome } from './search/view/SearchHome';
export { default as SearchResult } from './search/view/SearchResult';
export { default as SearchResultNone } from './search/view/SearchResultNone';
export { default as SearchResultOther } from './search/view/SearchResultOther';

/**
 *  인증
 */
// export { default as JuvenileProtection } from './certification/JuvenileProtection';
// export { default as AdultCertification } from './certification/AdultCertification';
// export { default as InitializationCompletionAdultCertification } from './certification/InitializationCompletionAdultCertification';
export { default as PhoneCertification } from './referenceSample/PhoneCertification/PhoneCertification';

export { default as ScheduleChart } from './deadTv';

/**
 * STB I/F Test
 */
export { default as StbTest } from './stbTest/StbTest';



export { default as TestCase } from './TestCase';