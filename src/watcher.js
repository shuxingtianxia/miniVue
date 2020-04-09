/* 
watcher模块负责把compile模块与observe模块关联起来
*/
class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        Dep.target = this
        // 需要把expr的旧值给存储起来
        this.oldValue = this.getVMValue(vm, expr)
        // 清空Dep.target
        Dep.target = null
    }
    // 对外暴漏的一个方法，这个方法用于更新页面
    update() {
        // 对比expr是否发生了改变，如果发生了改变，需要调用cb
        let oldValue = this.oldValue
        let newValue = this.getVMValue(this.vm, this.expr)
        // console.log(oldValue);
        if (oldValue != newValue) {
            // console.log(newValue);
            this.cb(newValue, oldValue)
        }
    }

    //用于获取vm中的数据
    getVMValue(vm, expr) {
        // 获取到data中的数据
        let data = vm.$data
        expr.split(".").forEach(key => {
            data = data[key]
        })
        return data
    }
}

/* dep对象用于管理所有的订阅者和通知这些订阅者 */
class Dep {
    constructor() {
        // 用于管理订阅者
        this.subs = []
    }

    // 添加订阅者
    addSub(watcher) {
        this.subs.push(watcher)
    }

    // 通知
    notify() {
        // 遍历所有的订阅者，调用watcher的update方法
        this.subs.forEach(sub => {
            sub.update()
        })
    }
}