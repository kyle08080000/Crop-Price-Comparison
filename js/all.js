const url = 'https://hexschool.github.io/js-filter-data/data.json';

const btnGroup = document.querySelector('.button-group'); // 按鈕群組
const showList = document.querySelector('.showList'); // 顯示列表
const seachGroup = document.querySelector('.seach-group'); // 搜尋組
const showResult = document.querySelector('.show-result'); // 顯示結果
const crop = document.getElementById('crop'); // 農作物輸入
const searchbtn = document.querySelector('.search'); // 搜尋按鈕
const sortSelect = document.querySelector('.sort-select'); // 排序選單
const sortAdvanced = document.querySelector('.js-sort-advanced'); // 進階排序
const sortMoblie = document.querySelector('.mobile-select'); // 手機版排序選單

// 獲取數據
const getData = async () => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(error);
    }
}
// 獲取數據並設置UI
getData().then(data => setupUI(data));

// 渲染數據
const renderData = (filteredData) => {
    const content = filteredData.length === 0
        ? `<tr><td colspan="7" class="text-center p-3">查詢不到當日的交易資訊：(</td></tr>` // 無數據時顯示
        : filteredData.map(item => `
            <tr>
                <td>${item.作物名稱}</td>
                <td>${item.市場名稱}</td>
                <td>${item.上價}</td>
                <td>${item.中價}</td>
                <td>${item.下價}</td>
                <td>${item.平均價}</td>
                <td>${item.交易量}</td>
            </tr>
        `).join(''); // 有數據時顯示
    showList.innerHTML = content;
}

// 更新類型並應用過濾器
const updateTypeAndApplyFilter = (data, type) => {
    const cropValue = crop.value.trim();
    if (!cropValue) {
        showResult.innerHTML = '';
        return;
    }
    showResult.textContent = type === 'search' ? `查看「${cropValue}」的比價結果` : '';
    const filteredData = applyFilter(data, type, cropValue);
    renderData(filteredData);
    if (filteredData.length > 0) {
        type = filteredData[0].種類代碼; // 讓按鈕群組的按鈕依據分類 active
        changeTab(type);
    }
}

// 應用過濾器
const applyFilter = (data, type, cropValue) => {
    return data.filter(item => {
        if (type === 'search') {
            return item.作物名稱 !== null && item.作物名稱.includes(cropValue);
        } else {
            return item.作物名稱 !== null && item.種類代碼 === type;
        }
    });
}

// 改變 active 的標籤
const changeTab = (type) => {
    const btns = document.querySelectorAll('.button-group > .btn');
    btns.forEach((item) => {
        item.classList.remove('active');
        if (item.dataset.type === type) {
            item.classList.add('active');
        }
    });
};

// 改變排序
const changeSort = (filteredData, price, sort) => {
    switch (sort) {
        case 'up':
            filteredData.sort((a, b) => b[price] - a[price]);
            break;
        case 'down':
            filteredData.sort((a, b) => a[price] - b[price]);
            break;
    }
    renderData(filteredData);
};

// 設置用戶界面
const setupUI = (data) => {
    let type = '';
    // 按鈕群組
    btnGroup.addEventListener('click', function(e){
        if (e.target.nodeName === 'BUTTON') {
            type = e.target.dataset.type;
            crop.value = '';
            const filteredData = applyFilter(data, type, '');
            renderData(filteredData);
            changeTab(type);
        }
    });
    // 農作物輸入
    crop.addEventListener('input', function() {
        type = 'search';
        updateTypeAndApplyFilter(data, type);
    });
    // 排序選單
    sortSelect.addEventListener('change', (e) => {
        const filteredData = applyFilter(data, type, crop.value.trim());
        changeSort(filteredData, e.target.value, 'up');
    });
    // 手機版排序選單
    sortMoblie.addEventListener('change', (e) => {
        const filteredData = applyFilter(data, type, crop.value.trim());
        changeSort(filteredData, e.target.value, 'up');
    });
    // 進階排序
    sortAdvanced.addEventListener('click', (e) => { 
        if (e.target.nodeName === 'I') {
            const filteredData = applyFilter(data, type, crop.value.trim());
            let price = e.target.dataset.price; 
            let sort = e.target.dataset.sort;
            changeSort(filteredData, price, sort);
        }
    });
}


