var historyList = [];

export const PUSH = 'PUSH';
export const POP = 'POP';

export function push(path, data) {
    // add = (data) => {
    historyList.push({
        path,
        data
    });
    // console.log('====================================');
    // console.log('path', path);
    // console.log('push historyList.length=', historyList.length);
    // console.log('====================================');
};

export function pop() {
    let rs = historyList.pop();
    rs = rs ? rs.data : '';
    // console.log('====================================');
    // console.log('pop historyList.length=' + historyList.length, rs);
    // console.log('====================================');
    return rs;
};

export function getList() {
    return historyList;
}

export function clear() {
    console.log('====================================');
    console.log('historyList clear ');
    console.log('====================================');
    historyList = [];
}

window.historyList = historyList;
// export default HistoryManager;