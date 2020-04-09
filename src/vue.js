class Vue{
    constructor(options = {}) {
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods
        // 监视data中的数据
        new Observer(this.$data)

        // 把data中所有的数据代理到了vm上
        this.proxy(this.$data)
        if(this.$el) {
            // 如果有el，则把el和实例传到compile进行编译
            new Compile(this.$el, this)
        }
    }
    proxy(data) {
        Object.keys(data).forEach(key => {
           Object.defineProperty(this, key, {
               enumerable: true,
               configurable: true,
               get() {
                   return data[key]
               },
               set(newValue) {
                   if(data[key] === newValue) return
                   data[key] = newValue
               }
           })
       })
    }
}
