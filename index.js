var bitmex = require("./bitmex_websocket");
var depDic = {}
bitmex.connect("wss://www.bitmex.com/realtime?heartbeat=1")

bitmex.listener.on("connect", function () {
    bitmex.subscribe("orderBookL2_25", "")
    bitmex.subscribe("instrument", "")
})

bitmex.listener.on("orderBookL2_25", function (order) {
    // console.log(order)
    switch (order.action) {
        case "partial":
            initDepth(order)
            break;
        case "update":
            updateDepth(order)
            break;
        case "delete":
            deleteDepth(order)
            break;
        case "insert":
            insertDepth(order)
            break;
        default:
            break;
    }
    printDepth(order)
})

bitmex.listener.on("instrument", function (ticker) {
    // console.log(new Date().toLocaleString(), ticker)
})

function printDepth(order) {
    let symbol = order.data[0].symbol
    console.log(symbol, depDic[symbol].length)
}

function initDepth(order) {
    for (let i = 0; i < order.data.length; i++) {
        let item = order.data[i]
        let dep = depDic[item.symbol]
        if (!dep) dep = []
        dep.push({
            id: item.id,
            side: item.side,
            size: item.size,
            price: item.price,
        })
        depDic[item.symbol] = dep
    }
}

function insertDepth(order) {

    let symbol = order.data[0].symbol,
        i = 0,
        j = 0,
        temp = [],
        dep = depDic[symbol]

    while (i < dep.length && j < order.data.length) {
        let item = order.data[j]
        if (dep[i].price > item.price) {
            temp.push(dep[i])
            i++
        } else {
            temp.push({
                id: item.id,
                side: item.side,
                size: item.size,
                price: item.price,
            })
            j++
        }
    }
    for (; i < dep.length; i++) {
        temp.push(dep[i])
    }
    for (; j < order.data.length; j++) {
        let item = order.data[j]
        temp.push({
            id: item.id,
            side: item.side,
            size: item.size,
            price: item.price,
        })
    }
    depDic[symbol] = temp
}

function deleteDepth(order) {
    let symbol = order.data[0].symbol,
        i = 0,
        j = 0,
        temp = [],
        dep = depDic[symbol]

    while (i < dep.length && j < order.data.length) {
        let item = order.data[j]
        if (dep[i].id == item.id) {
            j++
            i++
        } else {
            temp.push(dep[i])
            i++
        }
    }
    for (; i < dep.length; i++) {
        temp.push(dep[i])
    }
    depDic[symbol] = temp
}

function updateDepth(order) {

    let symbol = order.data[0].symbol,
        i = 0,
        j = 0,
        dep = depDic[symbol]

    while (i < dep.length && j < order.data.length) {
        if (dep[i].id == order.data[j].id) {
            dep[i].size = order.data[j].size
            i++
            j++
        } else {
            i++
        }
    }
    depDic[symbol] = dep
}