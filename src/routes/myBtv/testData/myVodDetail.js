import appConfig from "Config/app-config";

const NXPG010 = {
    contents: {
        espd_id: 'EP000000001',
        sris_id: 'CS000000001',
        bg_img_path: appConfig.headEnd.LOCAL_URL + '/tmp/mybtv/img.png', // 배경이미지
        // 줄거리
        sris_snss_cts: '꿈을 꾸는 사람들을 위한 별들의 도시 ‘라라랜드’. \n재즈 피아니스트 ‘세바스찬’과 배우 지망생 ‘미아’. \n인생에서 가장 빛나는 순간 만난 두 사람은 미완성인 서로의 무대를 만들어가기 시작한다.',
        title: '',
        title_img_path: appConfig.headEnd.LOCAL_URL + '/tmp/mybtv/bitmap.png',
    }
}

export { NXPG010 };