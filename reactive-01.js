function reactive(obj) {
  if (typeof obj !== 'object' && obj !== null) {
    return obj;
  }

  const observed = new Proxy(obj, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      console.log(`get ${key}: ${res}`);
      return res;
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver);
      console.log(`set ${key}: ${value}`);
      return res;
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key);
      console.log(`delete ${key}: ${res}`);
    }
  });

  return observed;
}

const state = reactive({ foo: 'foo', bar: { a: 1 } });

// 1. 获取
state.foo  // ok
// 2. 设置已存在的属性
state.foo = 'fooooooo'  // ok
// 3. 设置不存在属性
state.baz = 'baz'  // ok
// 4. 删除属性
delete state.baz  // ok
// 5. 设置嵌套对象属性
state.bar.a = 10  // no ok

// 6. 设置不存在属性为一个对象
state.data = { name: 'lisi' }  // no ok
state.data // no ok
state.data.name  // no ok
