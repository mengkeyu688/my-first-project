import { computed } from "vue"
import { useStore, mapState } from "vuex"


export function useMapState(moduleName, mapper) {
    // store独享
    const store = useStore()
    // 获取对应 module 的内容
    const storeStateFns = mapState(moduleName, mapper)
    // 数据映射
    const newStates = {}
    Object.keys(storeStateFns).forEach(fnKey => {
        const fn = storeStateFns[fnKey].bind({ $store: store })
        newStates[fnKey] = computed(fn)
    })
    return newStates
}