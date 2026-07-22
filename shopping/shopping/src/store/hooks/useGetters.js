import { computed } from 'vue'
import { mapGetters, useStore } from 'vuex'

export function useMapGetters(moduleName, mapper) {
    // store独享
    const store = useStore()
    // 获取对应 module 的内容
    const storeGetterFns = mapGetters(moduleName, mapper)
    // 数据映射
    const newGetters = {}
    Object.keys(storeGetterFns).forEach(Key => {
        const fn = storeGetterFns[Key].bind({$store: store})
        newGetters[Key] = computed(fn)
    })
    return newGetters
}