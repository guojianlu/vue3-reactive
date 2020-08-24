// 保存当前活动响应函数作为getter和effect之间桥梁
const effectStack = []

// effect任务:执行fn并将其入栈
function effect(fn) {
  const rxEffect = function() {
    // 1.捕获可能的异常
    try {
      // 2.入栈，用于后续依赖收集
      effectStack.push(rxEffect)
      // 3.运行fn，触发依赖收集
      return fn()
    } finally {
      // 4.执行结束，出栈
      effectStack.pop()
    }
  }

  // 默认执行一次响应函数
  rxEffect()

  // 返回响应函数
  return rxEffect
}


const isObject = val => val !== null && typeof val === 'object'

function reactive(obj) {
  if (!isObject(obj)) {
    return obj
  }

  const observed = new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      console.log(`get ${key}: ${res}`)
      // 依赖收集
      track(target, key)
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      console.log(`set ${key}: ${value}`)
      // 触发响应函数
      trigger(target, key)
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key);
      console.log(`delete ${key}: ${res}`)
      trigger(target, key)
      return res
    }
  });

  return observed;
}


// 映射关系表，结构大致如下:
// {target: {key: [fn1,fn2]}}
const targetMap = new WeakMap()
function track(target, key) {
  // 从栈中取出响应函数
  const effect = effectStack[effectStack.length - 1]

  if (effect) {
    // 获取target对应依赖表
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      depsMap = new Map()
      targetMap.set(target, depsMap)
    }

    // 获取key对应的响应函数集
    let deps = depsMap.get(key)
    if (!deps) {
      deps = new Set()
      depsMap.set(key, deps)
    }

    // 将响应函数加入到对应集合
    if (!deps.has(effect)) {
      deps.add(effect)
    }
  }
}


// 触发target.key对应响应函数
function trigger(target, key) {
  // 获取依赖表
  const depsMap = targetMap.get(target)
  if (depsMap) {
    // 获取响应函数集合
    const deps = depsMap.get(key)
    if (deps) {
      // 执行所有响应函数
      deps.forEach(effect => effect())
    }
  }
}


const state = reactive({
  foo: 'foo',
  bar: { a: 1 }
})

effect(() => {
  console.log('effect: ', state.foo)
})

state.foo = 'fooooo'
