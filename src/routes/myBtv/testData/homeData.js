const EPS300_DATA = {
    totalCount: 1,
    usableCount: 1,
    expiredCount: 0,
    newCount: 1,
    coupons: [
        {
            couponNo: 1,
            title: '쿠폰1',
            masterNo: 1,
            couponType: '구입',
            isNew: true,
            expireMessage: '기간만료'
        }
    ],
    usableBpoints: 2000,
    expireBpoints: 0,
    newBpoints: 2000,
    bpoints: [
        {
            bpointNo: '00000000000016443543',
            title: 'Oksusu 포인트 10000',
            masterNo: 'PR2020171000007729',
            balance: 10000,
            useRate: 80, // 사용율
            isNew: true,
            expireMessage: '기간만료'
        }
    ],
    tmembership: [
        {
            cardNo: '24961234********',
            grade: 'G', // V:VIP, G:Gold, S:Silver, A:Nomal
            balance: 3000, // 포인트
            discountRate: 15 // 할인율
        }
    ],
    ocbList: {
        ocb: [
            {
                sequence: 1,
                cardNo: 123145634,
                balance: 3800
            }
        ]
    },
    tvpoint: [
        {
            useTvpoint: true,
            id: 'STP0000000001',
            balance: 4800
        }
    ],
    tvpay: [
        {
            id: 'STP0000000001',
            url: 'http://tvpay.com'
        }
    ]
};

const PRODUCT_DATA = {
    name: 'B tv 상품명'
}

const BATTERY_DATA = {
    charged: 75
}

const METV_021 = {
    page_tot: 10,
    page_no: 1,
    watch_tot: 18,
    watch_no: 3,
    yn_ppm: 'N',
    watchList: '시청집합의 이름',
    List: [
        {
            sris_id: 's00012345',
            epsd_id: 'e00012345',
            epsd_rslu_id: '{0F439145-3AA4-11E2-9666-F32F121C886E}',
            series_no: 14,
            title: '겟아웃',
            level: 15,
            adult: 'N',
            thumbnail: '/assets/images/tmp/home_B_01.png',
            quality: 30,
            trans_type: 1,
            total_time: 100,
            watch_time: 13,
            reg_date: '18.03.19',
            material_cd: '80'
        },
        {
            sris_id: 's00012345',
            epsd_id: 'e00012345',
            epsd_rslu_id: '{0F439145-3AA4-11E2-9666-F32F121C886E}',
            series_no: 14,
            title: '스파이더맨',
            level: 15,
            adult: 'N',
            thumbnail: '/assets/images/tmp/home_B_01.png',
            quality: 30,
            trans_type: 1,
            total_time: 100,
            watch_time: 70,
            reg_date: '18.03.01',
            material_cd: '80'
        },
        {
            sris_id: 's00012345',
            epsd_id: 'e00012345',
            epsd_rslu_id: '{0F439145-3AA4-11E2-9666-F32F121C886E}',
            series_no: 14,
            title: '에일리언',
            level: 15,
            adult: 'N',
            thumbnail: '/assets/images/tmp/home_B_01.png',
            quality: 30,
            trans_type: 1,
            total_time: 100,
            watch_time: 80,
            reg_date: '18.03.19',
            material_cd: '80'
        },
        {
            sris_id: 's00012345',
            epsd_id: 'e00012345',
            epsd_rslu_id: '{0F439145-3AA4-11E2-9666-F32F121C886E}',
            series_no: 14,
            title: '대립군',
            level: 15,
            adult: 'N',
            thumbnail: '/assets/images/tmp/home_B_01.png',
            quality: 30,
            trans_type: 1,
            total_time: 100,
            watch_time: 90,
            reg_date: '18.03.19',
            material_cd: '80'
        },
        {
            sris_id: 's00012345',
            epsd_id: 'e00012345',
            epsd_rslu_id: '{0F439145-3AA4-11E2-9666-F32F121C886E}',
            series_no: 14,
            title: '하루',
            level: 15,
            adult: 'N',
            thumbnail: '/assets/images/tmp/home_B_01.png',
            quality: 30,
            trans_type: 1,
            total_time: 100,
            watch_time: 45,
            reg_date: '18.03.19',
            material_cd: '80'
        },
        {
            sris_id: 's00012345',
            epsd_id: 'e00012345',
            epsd_rslu_id: '{0F439145-3AA4-11E2-9666-F32F121C886E}',
            series_no: 14,
            title: '악녀',
            level: 15,
            adult: 'Y',
            thumbnail: '/assets/images/tmp/home_B_01.png',
            quality: 30,
            trans_type: 1,
            total_time: 100,
            watch_time: 45,
            reg_date: '18.03.19',
            material_cd: '80'
        }
    ]
}

const METV_035 = {
    page_tot: 10,
    page_no: 1,
    purchase_tot: 18,
    purchase_no: 3,
    purchaseList: '소장조합 이름',
    List: [
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '펄프픽션',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '레드',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '꽈배기 부인바람났네',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '천공의성 라퓨타',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '아이덴터티',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        }
        ,{
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '모노노케 히메',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '보스베이비',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        }
    ]
}

const TOP3_DATA = {
    list: [
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '아이덴터티',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        }
        ,{
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '모노노케 히메',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '보스베이비',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        }
    ]
}

const RECOMMEND_VOD = {
    list: [
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '아이덴터티',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        }
        ,{
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '모노노케 히메',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '보스베이비',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '모노노케 히메',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '모노노케 히메',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '모노노케 히메',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '모노노케 히메',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
        {
            sris_id : 's00012345',
            epsd_id : 'e00012345',
            prod_type: "소장용 VOD",
            prod_type_cd: 10,
            prod_id : 102221, // [상품식별자]
            epsd_rslu_id: '{EF2B8A98-6904-11E2-B2A1-FF7E72903272}',
            isbookmark: 'Y',
            title: '모노노케 히메',
            level: 18, 
            adult: 'Y', // / N
            poster: '/assets/images/tmp/home_A_01.png',
            nscreen: 'N',
            quality: 20,
            reg_date: '18.03.19', //yy.MM.dd
            end_late: '18.03.20', //yy.MM.dd
            period: '18.03.20', // 상품이용기간 기간 => yy.MM.dd
            period_detail: '상품 이용기간 상세', // { yy년MM월dd일00시까지 }, '소장용 해지전'
            material_cd: 65,
            method_pay_cd: null, //결재방식(null:후불, 10:핸드폰, 85:tv페이)
        },
    ]
}



export { 
    PRODUCT_DATA,
    EPS300_DATA,
    BATTERY_DATA,
    METV_021,
    METV_035, 
    TOP3_DATA,
    RECOMMEND_VOD
};