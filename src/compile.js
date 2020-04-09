class Compile {
    constructor(el, vm) {
        // el : 渲染元素
        // vm ：实例
        this.el = typeof el === 'string' ? document.querySelector(el) : el
        this.vm = vm

        if (this.el) {
            let fragment = this.node2fragment(this.el)
            this.compile(fragment)
            this.el.appendChild(fragment)
        }
    }
    /* 核心方法 */
    node2fragment(nodes) {
        // 创建文档碎片
        let fragment = document.createDocumentFragment()
        // 获取所有的子节点集合
        let childNodes = nodes.childNodes

        this.toArray(childNodes).forEach(node => {
            fragment.appendChild(node)
        });
        return fragment
    }

    // 编译
    compile(fragment) {
        let childNodes = fragment.childNodes
        this.toArray(childNodes).forEach(node => {
            // 元素节点
            if (this.isElementNode(node)) {
                // 如果是元素， 需要解析指令
                this.compileElement(node)

            }
            // 文本节点
            if (this.isTextNode(node)) {
                // 如果是文本节点， 需要解析插值表达式
                this.compileText(node)
            }
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }

        });
    }

    // 解析指令
    compileElement(node) {
        // 1. 获取到当前节点下所有的属性
        let attr = node.attributes
        this.toArray(attr).forEach(attr => {
            // 2. 解析vue的指令（所以以v-开头的属性）
            // 获取属性名
            let attrName = attr.name
            if(attrName.slice(0, 1) === '@'){
                attrName = attrName.replace('@', 'v-on:')
            }
            console.log(attrName);
            if (this.isDirective(attrName)) {
                // 截取属性名v-后面的
                let type = attrName.slice(2)
                // 获取属性值
                let expr = attr.value
                // 解析v-on指令
                if (this.isEventDirective(type)) {
                    // 是v-on的指令
                    CompileUtil.eventHandler(node, this.vm, expr, type)
                } else {
                    CompileUtil[type](node, this.vm, expr)
                }
            }
        })
    }
    // 解析双括号
    compileText(node) {
        CompileUtil.mustache(node, this.vm)
    }

    // 工具方法
    // 转成数组
    toArray(node) {
        // [].splice.call(node)
        return Array.from(node)
    }
    // 判断是不是元素节点
    isElementNode(node) {
        return node.nodeType === 1
    }
    // 判断是不是文本节点
    isTextNode(node) {
        return node.nodeType === 3
    }
    // 判断是不是以v-开头的属性
    isDirective(attrName) {
        return attrName.startsWith("v-")
    }
    // 判断是不是v-on指令
    isEventDirective(type) {
        return type.split(":")[0] === "on"
    }
}

let CompileUtil = {
    // 双大括号解析
    mustache(node, vm) {
        let txt = node.textContent
        let reg = /\{\{(.+)\}\}/
        if (reg.test(txt)) {
            let expr = RegExp.$1
            // debugger
            node.textContent = txt.replace(reg, this.getVMValue(vm, expr))

            new Watcher(vm, expr, newValue => {
                node.textContent = txt.replace(reg, newValue)
            })
        }
    },
    // 处理v-text指令
    text(node, vm, expr) {
        node.textContent = this.getVMValue(vm, expr)
        new Watcher(vm, expr, (newValue, oldValue) => {
            node.textContent = newValue
        })
    },
    // 处理v-html指令
    html(node, vm, expr) {
        node.innerHTML = this.getVMValue(vm, expr)
        new Watcher(vm, expr, newValue => {
            node.innerHTML = newValue
        })
    },
    // 处理v-model指令
    model(node, vm, expr) {
        let self = this
        node.value = self.getVMValue(vm, expr)
        // 实现双向的数据绑定， 给node注册input事件，当当前元素的value值发生改变，修改对应的数据
        node.addEventListener("input", function () {
            self.setVMValue(vm, expr, this.value)
        })
        new Watcher(vm, expr, newValue => {
            node.value = newValue
        })
    },
    // 这个方法用于获取VM中的数据
    getVMValue(vm, expr) {
        // 获取到data中的数据
        let data = vm.$data
        expr.split(".").forEach(key => {
            data = data[key]
        })
        return data
    },
    //
    setVMValue(vm, expr, value) {
        let data = vm.$data
        // car brand
        let arr = expr.split(".")

        arr.forEach((key, index) => {
            // 如果index是最后一个
            if (index < arr.length - 1) {
                data = data[key]
            } else {
                data[key] = value
            }
        })
    },
    // 解析v-no
    eventHandler(node, vm, expr, type) {
        let eventType = type.split(':')[1]
        let fn = vm.$methods && vm.$methods[expr]
        node.addEventListener(eventType, fn.bind(vm))
    }
}
