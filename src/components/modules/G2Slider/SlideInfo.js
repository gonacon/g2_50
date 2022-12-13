const SlideInfo = {
    TALL: {
        width: 246,
        height: 354,
        margin: 42,
        maxItem: 6
    },
    WIDE: {
        width: 306,
        height: 180,
        margin: 40,
        maxItem: 5
    },
    WATCHING_VOD: {
        width: 306,
        height: 180,
        margin: 40,
        maxItem: 5
    },
    RECENT_VOD: {
        width: 306,
        height: 180,
        margin: 40,
        maxItem: 5
    },
    EDITABLE_RECENT_VOD: {
        width: 306,
        height: 180,
        margin: 40,
        maxItem: 5
    },    
    EDITABLE_BOOKMARK_LIST: {
        width: 246,
        height: 354,
        margin: 40,
        maxItem: 6
    },
    MOVIE: {
        width: 306,
        height: 172,
        maxItem: 5,
        margin: 40
    },
    ACTOR_IMAGE: {
        width: 180,
        height: 180,
        maxItem: 7,
        margin: 70
    },
    ACTOR_TEXT: {
        width: 248,
        height: 268,
        maxItem: 6,
        margin: 0
    },
    RECOMMEND_VOD: {
        width: 196,
        height: 287,
        maxItem: 6,
        margin: 88
    },
    BOOKMARK_VOD: {
        width: 246,
        height: 354,
        margin: 40,
        maxItem: 6
    },
    SYNOPSHORT: {
        width: 306,
        height: 172,
        maxItem: 5,
        margin: 40
    },
    PEOPLE: {
        width: 180,
        height: 180,
        maxItem: 7,
        margin: 12
    },
    PEOPLE_NONE: {
        width: 248,
        height: 178,
        maxItem: 6,
        margin: 40
    },
    PEOPLESERIES_NONE: {
        width: 248,
        height: 178,
        maxItem: 5,
        margin: 40
    },
    SYNOPSERIES_INFO: {
        width: 248,
        height: 140,
        maxItem: 6,
        margin: 20
    },
    KIDS_MONTHLY: {
        width: 340,
        height: 637,
        maxItem: 5,
        margin: 0
    },
    MENU_BLOCK: {
        width: 346,
        height: 172,
        maxItem: 5,
        margin: 0,
    },
    KIDS_TYPE_CIRCLE: {
        width: 180,
        height: 180,
        maxItem: 7,
        margin: 0
    },
    KIDS_TYPE_B: {
        width: 306,
        height: 180,
        maxItem: 5,
        margin: 40
    },
    KIDS_TYPE_C: {
        width: 384,
        height: 250,
        maxItem: 4,
        margin: 0
    },
    SYNOPSHORT_REVIEW: {
        width: 0,
        height: 0,
        maxItem: 6,
        margin: 34
    },
    SYNOPSERIES: {
        width: 248,
        height: 140,
        maxItem: 5,
        margin: 20
    },
    SYNOPSHORT_STEEL: {
        width: 150,
        height: 180,
        maxItem: 9,
        margin: 42
    },
    EVENT: {
        width: 1690,
        height: 220,
        maxItem: 1,
        margin: 0
    },
    MONTHLY: {
        width: 438,
        height: 285,
        maxItem: 4,
        margin: 0
    },
    HORIZONTAL: {
        width: 434,
        height: 250,
        maxItem: 4,
        margin: 0
    },
    SYNOPGATEWARY: {
        width: 246,
        height: 354,
        margin: 40,
        maxItem: 5
    },
    EVENT_COUPLE: {
        width: 824,
        height: 220,
        maxItem: 2,
        margin: 0,
    },
    EVENT_TRIPLE: {
        width: 536,
        height: 212,
        maxItem: 3,
        margin: 0,
    },
    RECOMMEND: {
        width: 246,
        height: 354,
        margin: 40,
        maxItem: 6
    },
    SYNOPSERIES_INFO_NONE: {
        width: 167,
        height: 94,
        maxItem: 10,
        margin: 0,
    },
    SEARCH_MAIN: {
        width: 188,
        height: 268,
        margin: 34,
        maxItem: 7,
    }
};

const SlideType = {
    TALL: 'TALL',
    WIDE: 'WIDE',
    MENU_BLOCK: 'MENU_BLOCK',
    WATCHING_VOD: 'WATCHING_VOD',
    RECENT_VOD: 'RECENT_VOD',
    RECOMMEND_VOD: 'RECOMMEND_VOD',
    BOOKMARK_VOD: 'BOOKMARK_VOD',
    EDITABLE_RECENT_VOD: 'EDITABLE_RECENT_VOD',
    EDITABLE_BOOKMARK_LIST: 'EDITABLE_BOOKMARK_LIST',
    MOVIE: 'MOVIE',
    ACTOR_IMAGE: 'ACTOR_IMAGE',
    ACTOR_TEXT: 'ACTOR_TEXT',
    SYNOPSHORT: 'SYNOPSHORT',
    PEOPLE: 'PEOPLE',
    PEOPLE_NONE: 'PEOPLE_NONE',
    PEOPLESERIES_NONE: 'PEOPLESERIES_NONE',
    SYNOPSERIES_INFO: 'SYNOPSERIES_INFO',
    KIDS_MONTHLY: 'KIDS_MONTHLY',
    KIDS_TYPE_CIRCLE: 'KIDS_TYPE_CIRCLE',
    KIDS_TYPE_B: 'KIDS_TYPE_B',
    KIDS_TYPE_C: 'KIDS_TYPE_C',
    SYNOPSHORT_REVIEW: 'SYNOPSHORT_REVIEW',
    SYNOPSERIES: 'SYNOPSERIES',
    SYNOPSHORT_STEEL: 'SYNOPSHORT_STEEL',
    EVENT: 'EVENT',
    MONTHLY: 'MONTHLY',
    HORIZONTAL: 'HORIZONTAL',
    SYNOPGATEWARY: 'SYNOPGATEWARY',
    EVENT_COUPLE: 'EVENT_COUPLE',
    EVENT_TRIPLE: 'EVENT_TRIPLE',
    RECOMMEND: 'RECOMMEND',
    SYNOPSERIES_INFO_NONE: 'SYNOPSERIES_INFO_NONE',
    SEARCH_MAIN: 'SEARCH_MAIN'
};

const DIR = {
    LEFT: 0,
    RIGHT: 1
};

export { SlideInfo, SlideType, DIR };