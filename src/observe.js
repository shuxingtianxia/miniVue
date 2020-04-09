/* 
  observer用于给data中所有的数据添加getter和setter
  方便我们在获取或者设置data中数据的时候，实现我们的逻辑
*/
class Observer {
    constructor(data) {
        this.data = data
        this.walk(this.data)
    }
    walk(data) {
        if (!data || typeof data != 'object') return
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
            this.walk(data[key])
        })
    }
    // 定义响应式的数据（数据劫持）

    // data中的每一个数据都应该维护一个dep对象
    // dep保存了所有的订阅了该数据的订阅者
    defineReactive(obj, key, value) {
        let _this = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue) {
                if(value == newValue) return
                value = newValue
                _this.walk(newValue)
                dep.notify()
            }
        })
    }
}