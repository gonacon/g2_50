const SlideInfo = {
    KIDS_CONTENT_VER_SLIDE: { width: 246, height: 354, maxItem: 6, margin: 0, className: 'slideTypeAD' },
    KIDS_CONTENT_HOR_SLIDE: { width: 434, height: 250, imgWidth: 383, maxItem: 4, margin: 0, className: 'slideTypeBC' },
    // KIDS_CONTENT_HOR_SLIDE: { width: 306, height: 180, maxItem: 5, margin: 0, className: 'slideTypeB' },
    KIDS_CW_SLIDE: { width: 384, height: 250, maxItem: 4, margin: 0, className: 'slideTypeC' },
    
    KIDS_MENU_SLIDE: { width: 346, height: 172, maxItem: 5, margin: 0, className: 'slideGenreBlock' },
    KIDS_CIRCLE_SLIDE: { width: 180, height: 180, maxItem: 7, margin: 0, className: 'slideTypeCircle' },

    KIDS_BANNER_SLIDE_A: { width: 536, height: 212, maxItem: 3, margin: 0, className: 'eventSlideTypeA' },
    KIDS_BANNER_SLIDE_B: { width: 824, height: 220, maxItem: 2, margin: 0, className: 'eventSlideTypeB' },
    KIDS_BANNER_SLIDE_C: { width: 1690, height: 220, maxItem: 1, margin: 0, className: 'eventSlideTypeC' },

    KIDS_CHARACTER_HOME: { width: 330, height: 635, maxItem: 5, margin: 0, className: 'characterSlideInner' },
    KIDS_PLAY_LEARNING: { width: 410, height: 553, maxItem: 4, margin: 0, className: 'playLearningSlide' },
    KIDS_MONTHLY_HOME: { width: 340, height: 637, maxItem: 5, margin: 0, className: 'kidsMonthlySlide' }
};

const SlideType = {
    KIDS_CW_SLIDE: 'KIDS_CW_SLIDE',
    KIDS_CONTENT_HOR_SLIDE: 'KIDS_CONTENT_HOR_SLIDE',
    KIDS_CONTENT_VER_SLIDE: 'KIDS_CONTENT_VER_SLIDE',
    KIDS_MENU_SLIDE: 'KIDS_MENU_SLIDE',
    KIDS_CIRCLE_SLIDE: 'KIDS_CIRCLE_SLIDE',
    KIDS_BANNER_SLIDE_A: 'KIDS_BANNER_SLIDE_A',
    KIDS_BANNER_SLIDE_B: 'KIDS_BANNER_SLIDE_B',
    KIDS_BANNER_SLIDE_C: 'KIDS_BANNER_SLIDE_C',

    KIDS_MONTHLY_HOME: 'KIDS_MONTHLY_HOME',
    KIDS_CHARACTER_HOME: 'KIDS_CHARACTER_HOME',
    KIDS_PLAY_LEARNING: 'KIDS_PLAY_LEARNING',
};

const DIR = {
    LEFT: 0,
    RIGHT: 1
};

export { SlideInfo, SlideType, DIR };