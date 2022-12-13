import React, { Component } from 'react';
import { CTSInfo } from 'Supporters/CTSInfo';
import { RecentVODList } from '../../myBtv/component/vodLists';

class RecentVODListHome extends Component {
    onSelectRecentVod = (flag, idx) => {
		let slideItem = this.props.list[idx];
		CTSInfo.requestWatchVODForOthers({
            search_type: '2',
			epsd_rslu_id: slideItem.epsdRsluId,
			seeingPath: '13'	 //시청컨텐츠를 통한 VOD 시청(마이Btv-최근시청-최근시청목록)
		});
    }
    
    render() {
        return (
            <RecentVODList {...this.props}
                            onSelect={this.props.onSelect ? this.props.onSelect :  this.onSelectRecentVod}
            />
        )
    }
}

export default RecentVODListHome;